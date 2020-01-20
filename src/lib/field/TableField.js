import Vue from 'vue'
import { isVoid } from 'src/lib/utils'
import Field from './Field'
import TableWidget from './widgets/form/Table'

export default class TableField extends Field {
  constructor (info) {
    info.virtual = true

    const options = info.widget_options
    delete info.widget_options

    super(info)

    this.toField = options.to_field
    this.layer = options.dblayer
    this.layerFk = options.dblayer_fk
  }

  onFieldsCreated (fields) {
    this.uniqueField = fields.find(f => f.name === this.toField)
  }

  relatedFields () {
    return [
      this.uniqueField
    ]
  }

  getValue (data) {
    const value = super.getValue(data) || {}
    value._fk = this.uniqueField.getValue(data)
    return value
  }

  setValue ({ row, properties, value }) {
    const props = properties || (row && row.properties)
    if (props) {
      Vue.set(props, this.name, value)
    }
  }

  aggregate (rows) {
    if (rows.length === 1) {
      return this.getValue({ row: rows[0] })
    }
  }

  str (data) {
    return void 0
  }

  repr (data) {
    return void 0
  }

  tableValue (data) {
    const value = this.getValue(data)
    if (value && !isVoid(value.count)) {
      return value.count
    }
  }

  popupValue (data) {
    return this.getValue(data)
  }

  formWidget () {
    return TableWidget
  }
}
