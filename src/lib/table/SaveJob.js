import { AsyncJob } from 'src/lib/async'
import { map, zip } from 'src/lib/itertools'
import except from 'src/lib/except'

import { toRows } from './row'

export default class SaveJob extends AsyncJob {
  constructor (table, rowChanges) {
    const func = () => this.saveChanges()
    super({ func }, Array.from(rowChanges.dependencies))

    this.table = table
    this.repr = null
    this.rowChanges = rowChanges
    this.incrementReference()

    // Add it as dependency to the rows
    for (let row of rowChanges.changedRows) {
      row.addSaveJob(this)
    }
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
        throw e
      }

      const status = e.response.status
      if (status === 400) {
        console.warn('[SaveJob] User error')
      } else if (status === 401 || status === 403) {
        console.warn('[SaveJob] Credentials fail || Unauthorized')
      } else {
        console.warn('[SaveJob] Programming error / backend error / desync frontend - backend')
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
}
