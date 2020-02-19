import { AsyncJob } from 'src/lib/async'
import except from 'src/lib/except'
import { map, zip } from 'src/lib/itertools'
import { notifyError } from 'src/lib/notifications'
import { cloneClean } from 'src/lib/utils'

import { toRows } from './row'
import RowChanges from './RowChanges'

import FixRowsDialog from 'src/components/data-layer/FixRowsDialog'

export default class SaveJob extends AsyncJob {
  constructor (table, rowChanges) {
    const func = () => this.saveChanges()
    super({ func }, Array.from(rowChanges.dependencies))

    this.table = table
    this.$root = table.$root
    this.repr = null
    this.fixing = false
    this.rowChanges = rowChanges
    this.incrementReference()

    // Add it as dependency to the rows
    for (let row of rowChanges.changedRows) {
      row.addSaveJob(this)
    }
  }

  get delay () {
    return this.fixing || super.delay
  }

  async saveChanges () {
    if (!this.repr) {
      this.repr = this.rowChanges.repr()
    }

    let response
    try {
      response = await this.table.remote.save(this.repr)
    } catch (e) {
      this.repr = null
      if (!e.response) {
        console.error(e)
        throw e
      }

      const status = e.response.status
      if (status === 400) {
        console.warn('[SaveJob] User error')
        this.fixing = true
        try {
          await this.fixChanges(e.response.data)
        } catch (e) {
          console.log(e)
          throw e
        }
        return AsyncJob.retry
      } else if (status === 401 || status === 403) {
        console.warn('[SaveJob] Credentials fail / Unauthorized')
        notifyError('Permission denied at saving the changes', { timeout: 3000 })
      } else {
        console.warn('[SaveJob] Programming error / backend error / desync frontend - backend')
        notifyError('Couldn\'t save the changes', { timeout: 3000 })
        console.error(e)
      }
      throw e
    }

    const { data } = response
    try {
      if (data && data.ADD) {
        const pks = map(data.ADD, entry => entry.id)
        for (let [row, pk] of zip(this.rowChanges.newRows, pks)) {
          row.setPk(pk)
        }
      }
      for (let row of this.rowChanges.deletedRows) {
        this.table.remote.filters.deleted.delete(row.pk)
      }

      {
        const rowMap = new Map(map(this.rowChanges.changedRows, row => [row.pk, row]))
        const { data } = await this.table.remote.requestSpecificData(this.rowChanges.changedRows)
        for (let newRow of toRows(this.table, data)) {
          const oldRow = rowMap.get(newRow.pk)
          if (oldRow) {
            oldRow.merge(newRow)
          }
        }
      }
    } catch (e) {
      except(e)
    }
  }

  reconstructRow (row, properties) {
    const diffRow = new (row.constructor)(this.table, {})
    diffRow.serverProperties = diffRow.consolidatedProperties = cloneClean(row.serverProperties)
    diffRow.properties = { ...diffRow.serverProperties, ...cloneClean(properties) }
    return diffRow
  }

  async fixChanges (data) {
    const added = this.rowChanges.changes.add
    const updated = this.rowChanges.changes.update

    const toFix = []
    if (data.ADD) {
      for (let i in added) {
        const error = data.ADD[i]
        if (error) {
          const { row, properties } = added[i]
          toFix.push({
            row: this.reconstructRow(row, properties),
            error,
            originalProperties: properties
          })
        }
      }
    }
    if (data.UPDATE) {
      for (let { row, properties } of updated) {
        const error = data.UPDATE[row.pk]
        if (error) {
          toFix.push({
            row: this.reconstructRow(row, properties),
            error,
            originalProperties: properties
          })
        }
      }
    }

    for (;;) {
      const api = await this.$root.$store.dispatch('layout/createDialog', {
        root: this.$root,
        component: FixRowsDialog,
        toFix,
        table: this.table
      })
      const done = await new Promise(resolve => {
        api
          .onOk(() => resolve(true))
          .onCancel(() => resolve(false))
      })
      if (done) {
        for (let { row, originalProperties } of toFix) {
          for (let key in originalProperties) {
            originalProperties[key] = void 0
          }
          const newProperties = RowChanges.propertiesDiff(this.table.info.fields, row.properties, row.serverProperties)
          Object.assign(originalProperties, newProperties)
        }

        // try again now that the values are fixed
        this.fixing = false
        return
      }
    }
  }
}
