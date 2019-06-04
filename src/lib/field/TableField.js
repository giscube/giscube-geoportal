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

  getValue (data) {
    return this.uniqueField.getValue(data)
  }

  str (data) {
    return void 0
  }

  repr (data) {
    return void 0
  }

  formWidget () {
    return TableWidget
  }
}
