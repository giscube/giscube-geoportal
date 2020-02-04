import Vue from 'vue'
import { isVoid } from 'src/lib/utils'

import Field from './Field'
import FormWidget from './widgets/form/DateTime'
import FilterComponent from './components/filter/Interval'

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

  dateTimeRepr (data, format) {
    const v = this.getValue(data)
    if (isVoid(v)) {
      return v
    } else if (v.isValid()) {
      return v.format(format)
    } else {
      return void 0
    }
  }

  repr (data) {
    return this.dateTimeRepr(data, 'YYYY-MM-DD HH:mm:ss')
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

  toValidMoment (v) {
    if (v) {
      if (v && v.isValid()) {
        return v
      }
    }
    return null
  }

  filter (data, filter) {
    const v = this.getValue(data)
    const f = filter && this.moment(filter)
    return f && f.isValid() && f.isSame(v)
  }

  colFilter (data, filter) {
    if (!filter) {
      return true
    }

    let { min, max } = filter
    min = this.toValidMoment(min)
    max = this.toValidMoment(max)

    const value = this.getValue(data)
    if (!value) {
      return !(min || max)
    }

    return (!max || value.isSameOrBefore(max)) && (!min || value.isSameOrAfter(min))
  }

  filterComponent () {
    return FilterComponent
  }
}
