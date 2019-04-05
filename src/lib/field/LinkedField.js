import { isCleanEqual } from '../utils.js'
import Field from './Field'

export default class LinkedField extends Field {
  validValue (value) {
    return value !== undefined && value !== null
  }

  constructor (info) {
    info['readonly'] = true
    super(info)
  }

  onUpdate (field, value, properties, callback) {
    if (field !== this.sourceField) {
      return
    }

    const origValue = this.getValue({ properties })

    if (this.validValue(value) && this.sourceField.valuesDict) {
      value = field.valuesDict[value]
      if (this.validValue(value) && this.column) {
        const i = field.values_list_headers.indexOf(this.column)
        if (i >= 0) {
          value = value[i]
        } else {
          console.warn(`Column "${this.column}" is not part of list of headers ${this.sourceField.values_list_headers}`)
          value = value[0]
        }
      }
    }

    this.property.forEach(ref => {
      if (this.validValue(value)) {
        value = value[ref]
      }
    })

    this.setValue({ properties, value })

    if (!isCleanEqual(value, origValue)) {
      callback(value)
    }
  }
}
