import { isCleanEqual } from '../utils.js'
import Field from './Field'

export default class LinkedField extends Field {
  validValue (value) {
    return value !== undefined && value !== null
  }

  constructor (info) {
    info['readonly'] = true
    const options = info.widget_options
    info.source = options['source']
    info.column = options['column']

    const property = options['property']
    info.property = property ? property.split('.') : []

    super(info)
  }

  onFieldsCreated (fields) {
    this.sourceField = fields.find(f => f.name === this.source)
  }

  relatedFields () {
    return [
      this.sourceField
    ]
  }

  getLinkedValue (value) {
    if (this.validValue(value) && this.sourceField.valuesDict) {
      value = this.sourceField.valuesDict[value]
      if (this.validValue(value) && this.column) {
        const i = this.sourceField.headers.indexOf(this.column)
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

    return value
  }

  getValue (data) {
    let value = this.virtual ? void 0 : super.getValue(data)
    if (value === void 0 || value === null) {
      value = this.getLinkedValue(this.sourceField.getValue(data))
    }
    return value
  }

  onUpdate (field, value, properties, callback) {
    if (this.virtual || field !== this.sourceField) {
      return
    }

    const origValue = this.getValue({ properties })
    value = this.getLinkedValue(value)

    this.setValue({ properties, value })

    if (!isCleanEqual(value, origValue)) {
      callback(value)
    }
  }
}
