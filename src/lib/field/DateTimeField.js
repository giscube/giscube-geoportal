import Vue from 'vue'

import Field from './Field'
import FormWidget from './widgets/form/DateTime'

export default class DateTimeField extends Field {
  constructor (info) {
    info.format = info.format || (info.widget_options && info.widget_options.format) || 'YYYY-MM-DD HH:mm:ss'
    super(info)

    this.mask = this.format.replace(/\w/g, '#')
  }

  get moment () {
    return Vue.prototype.$moment
  }

  getValue (data) {
    let value = super.getValue(data)
    if (!value) {
      return value
    }

    if (!this.moment.isMoment(value)) {
      value = this.moment.utc(value)
    }
    return value
  }

  cloneValue (value) {
    return value && this.moment(value)
  }

  val2str (value) {
    return value && value.format(this.format)
  }

  input2val (str) {
    if (!str) {
      return null
    }

    if (str.length !== this.format.length) {
      return this.moment.invalid() // make an invalid moment object
    }
    return this.moment.utc(str, this.format)
  }

  repr (data) {
    const v = this.getValue(data)
    if (v && v.isValid()) {
      return v.format(this.format)
    } else {
      return null
    }
  }

  equals (a, b) {
    const av = this.getValue(a)
    const bv = this.getValue(b)

    if (!av) {
      return !bv
    }
    return av.isSame(bv)
  }

  formWidget () {
    return FormWidget
  }

  rules (t) {
    return [
      ...super.rules(t),
      value => {
        const v = this.input2val(value)
        if (!v) {
          return true
        }
        return v.isValid() || t('tools.data.invalidDate', { invalidAt: v.invalidAt() })
      }
    ]
  }
}
