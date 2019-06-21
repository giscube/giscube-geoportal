import DateTimeField from './DateTimeField'

export default class DateField extends DateTimeField {
  constructor (info) {
    info.format = info.format || (info.widget_options && info.widget_options.format) || 'YYYY-MM-DD'
    super(info)
  }

  repr (data) {
    const value = this.getValue(data)
    return (value === null || value === void 0) ? null : value.format('YYYY-MM-DD')
  }
}
