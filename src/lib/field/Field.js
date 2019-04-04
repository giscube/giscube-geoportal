import DefaultWidget from './widgets/form/Default'
import { escapeHtml } from '../../lib/utils.js'

export default class Field {
  constructor (info) {
    // Copy all values as mine
    Object.keys(info).forEach(key => {
      Object.defineProperty(this, key, {
        value: info[key],
        writable: false
      })
    })
  }

  getValue ({ feature, properties }) {
    const props = properties || (feature && feature.properties)
    return props && props[this.name]
  }

  setValue ({ feature, properties, value }) {
    const props = properties || (feature && feature.properties)
    if (props) {
      props[this.name] = value
    }
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
    return [ value => this.null || value !== null || value !== undefined || t('tools.data.requiredField') ]
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
