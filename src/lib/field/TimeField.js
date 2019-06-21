import DateTimeField from './DateTimeField'

export default class TimeField extends DateTimeField {
  constructor (info) {
    info.format = info.format || (info.widget_options && info.widget_options.format) || 'HH:mm:ss'
    super(info)
  }

  repr (data) {
    const value = this.getValue(data)
    return (value === null || value === void 0) ? null : value.format('HH:mm:ss')
  }
}
