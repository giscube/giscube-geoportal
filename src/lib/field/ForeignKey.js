import Field from './Field'

export default class ForeignKey extends Field {
  constructor (info) {
    info['readonly'] = true
    const options = info.widget_options
    super(info)

    this.layer = { name: options.dblayer }
    this.toField = options.to_field
  }
}
