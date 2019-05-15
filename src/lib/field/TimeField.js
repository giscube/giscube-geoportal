import DateTimeField from './DateTimeField'

export default class TimeField extends DateTimeField {
  constructor (info) {
    info.format = info.format || (info.widget_options && info.widget_options.format) || 'HH:mm:ss'
    super(info)
  }

  repr (data) {
    return this.getValue(data).format('HH:mm:ss')
  }
}
