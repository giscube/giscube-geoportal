import DateTimeField from './DateTimeField'

export default class DateField extends DateTimeField {
  constructor (info) {
    info.format = info.format || (info.widget_options && info.widget_options.format) || 'YYYY-MM-DD'
    super(info)
  }

  repr (data) {
    return this.dateTimeRepr(data, 'YYYY-MM-DD')
  }
}
