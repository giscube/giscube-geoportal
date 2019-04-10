import DefaultWidget from './widgets/form/Default'
import { cloneClean, isCleanEqual, escapeHtml } from '../utils.js'
import AsyncValue from '../async/Value'

export default class Field {
  constructor (info) {
    // Copy all values as mine
    Object.keys(info).forEach(key => {
      Object.defineProperty(this, key, {
        value: info[key],
        writable: true,
        configurable: true,
        enumerable: true
      })
    })

    this.requiresFeatures = false
  }

  getValue ({ feature, properties }) {
    const props = properties || (feature && feature.properties)
    return props && props[this.name]
  }

  setValue ({ feature, properties, value }) {
    const props = properties || (feature && feature.properties)
    if (props) {
      if (AsyncValue.is(value)) {
        value.incrementReference()
      }
      if (AsyncValue.is(props[this.name])) {
        props[this.name].decrementReference()
      }
      props[this.name] = value
    }
  }

  equals (a, b) {
    const av = this.getValue(a)
    const bv = this.getValue(b)

    if (AsyncValue.is(av) !== AsyncValue.is(bv)) {
      return false
    } else if (AsyncValue.is(av)) {
      // both are async values thus we need just need to compare if they are the same object
      return av === bv
    } else {
      return isCleanEqual(av, bv)
    }
  }

  cloneValue ({ feature, properties, cleanup = false }) {
    let value = this.getValue({ feature, properties })
    if (value === '' || value === undefined) {
      if (cleanup) {
        value = null
      }
    } else if (AsyncValue.is(value)) {
      // Keep the same value
    } else {
      value = cloneClean(value)
    }

    return value
  }

  cloneSetValue (a, b) {
    this.setValue({ ...b, value: this.cloneValue(a) })
  }

  moveValue (from, to) {
    from = from.properties || (from.feature && from.feature.properties)
    to = to.properties || (to.feature && to.feature.properties)

    if (AsyncValue.is(to[this.name])) {
      to[this.name].decrementReference()
    }
    to[this.name] = from[this.name]
    from[this.name] = null
  }

  val2str (value) {
    return Field.toString(value)
  }

  str (feature) {
    return this.val2str(this.getValue(feature))
  }

  repr (data) {
    return this.getValue(data)
  }

  tableValue (data) {
    return this.str(data)
  }

  popupValue (data) {
    // SECURITY: BE AWARE OF XSS
    return escapeHtml(this.str(data))
  }

  formWidget () {
    return DefaultWidget
  }

  onUpdate (updatedField, value, properties, callback) {
    // Do nothing
  }

  rules (t) {
    return [
      value => this.null || (value !== null && value !== undefined) || t('tools.data.requiredField')
    ]
  }

  isValid (data, t) {
    const value = this.getValue(data)
    for (let rule in this.rules(t)) {
      const validation = rule(value)
      if (validation !== true) {
        return validation
      }
    }
    return true
  }

  static toString (value) {
    if (value === undefined || value === null) {
      return ''
    } else {
      return value.toString()
    }
  }
}
