import DefaultWidget from './widgets/form/Default'

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

  getValue (feature) {
    return feature.properties[this.name]
  }

  str (feature) {
    return Field.toString(this.getValue(feature))
  }

  repr (feature) {
    return this.str(feature)
  }

  tableValue (feature) {
    return this.str(feature)
  }

  formWidget () {
    return DefaultWidget
  }

  rules (t) {
    return [ value => this.null || value !== null || value !== undefined || t('tools.data.requiredField') ]
  }

  isValid (feature, t) {
    const value = this.getValue()
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
