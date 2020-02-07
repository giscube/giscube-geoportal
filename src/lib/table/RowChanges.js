import { AsyncJob } from 'src/lib/async'
import except from 'src/lib/except'
import { getGeometry } from 'src/lib/geoJson'

export default class RowChanges {
  constructor (rows, info) {
    this.persistentRows = new Set()
    this.deletedRows = new Set()
    this.changedRows = []
    this.newRows = []
    this.changes = {
      add: [],
      update: [],
      delete: []
    }
    this.dependencies = new Set()
    this.info = info

    for (let row of rows) {
      if (row.status.new && row.status.deleted) {
        // Cancel any async value because they won't be used
        for (let value of row.asyncValues) {
          value.cancel()
        }
      } else {
        if (row.status.deleted) {
          row.remove()
        } else {
          this.persistentRows.add(row)
        }
        if (row.status.new || row.status.edited || row.status.deleted) {
          this.changedRows.push(row)
          if (row.status.deleted) {
            this.deletedRows.add(row)
          } else if (row.status.new) {
            this.newRows.push(row)
          }
          this.consolidateChanges(row)
        }
      }
    }
  }

  consolidateChanges (row) {
    // Get data changes
    if (row.status.deleted) {
      this.changes.delete.push(row.pk)
    } else {
      const geom = this.info.hasGeom && !this.info.readonlyGeom && (row.status.new || row.status.geomEdited) ? getGeometry(row.layer, this.info.geomType) : void 0

      if (row.status.new) {
        this.changes.add.push({ row, properties: row.properties, geom })
      } else {
        const properties = {}
        for (let field of this.info.fields) {
          const new_ = { properties: row.properties }
          const old = { properties: row.consolidatedProperties }
          if (!field.virtual && !field.constant && !field.equals(new_, old)) {
            field.setValue({ properties, value: field.getValue(new_) })
          }
        }
        this.changes.update.push({ row, properties, geom })
      }
    }

    // Set dependencies
    for (let d of row.dependencies) {
      this.dependencies.add(d)
    }

    row.consolidateChanges()
  }

  _rowRepr (rows) {
    const reprs = []
    for (let { row, properties, geom } of rows) {
      const repr = row.getEmpty()
      row.copyPk(repr, row.pk)

      const props = {}
      for (let field of this.info.fields) {
        if (!field.constant && !field.readonly && !field.virtual) {
          const value = field.getValue({ properties })
          if (AsyncJob.is(value) && !value.done) {
            except(new Error('Trying to serialize an unfinished async value'), { hide: true })
          }
          const repr = field.repr({ properties })
          if (repr !== void 0) {
            props[field.name] = repr
          }
        }
      }

      this.info.propsPath.setTo(repr, props)
      if (this.info.hasGeom && !this.info.readonlyGeom) {
        this.info.geomPath.setTo(repr, geom)
      }
      reprs.push(repr)
    }
    return reprs
  }

  repr () {
    return {
      ADD: this._rowRepr(this.changes.add),
      UPDATE: this._rowRepr(this.changes.update),
      DELETE: this.changes.delete
    }
  }
}
