import Vue from 'vue'

import DottedPath from '../DottedPath'
import AsyncValue from '../async/Value'
import MultiResult from '../MultiResult'
import { cloneClean, isCleanEqual } from '../utils.js'

import DefaultWidget from './widgets/form/Default'

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
    this.path = new DottedPath(this.name)
  }

  // Callback with all the fields that have been created
  // onFieldsCreated (fields) {}

  getValue ({ row, properties, value }) {
    if (value !== void 0) {
      return value
    }
    const props = properties || (row && row.properties)
    return this.path.extractFrom(props)
  }

  setValue ({ row, properties, value }) {
    if (this.virtual) {
      throw new Error('Cannot set value of virtual field')
    }
    const props = properties || (row && row.properties)
    if (props) {
      if (AsyncValue.is(value)) {
        value.incrementReference()
      }
      if (AsyncValue.is(props[this.name])) {
        props[this.name].decrementReference()
      }
      this.path.setTo(props, value, Vue.set)
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
    } else if (MultiResult.is(av) !== MultiResult.is(bv)) {
      return false
    } else if (MultiResult.is(av)) {
      return av === bv
    } else {
      return isCleanEqual(av, bv)
    }
  }

  clone ({ row, properties, cleanup = false }) {
    if (this.virtual) {
      throw new Error('Cannot clone value of virtual field')
    }
    let value = this.getValue({ row, properties })
    if (value === '' || value === undefined) {
      if (cleanup) {
        value = null
      }
    } else {
      value = this.cloneValue(value)
    }

    return value
  }

  aggregate (rows) {
    if (this.virtual) {
      return
    }

    let aggregation
    for (let row of rows) {
      const value = this.clone({ row, cleanup: true })
      if (aggregation === undefined) {
        aggregation = value
      } else if (MultiResult.is(aggregation)) {
        aggregation.values.add(value)
      } else if (aggregation !== value) {
        aggregation = new MultiResult([value, aggregation])
      }
    }
    return aggregation
  }

  cloneValue (value) {
    if (AsyncValue.is(value)) {
      // Keep the same value
    } else {
      value = cloneClean(value)
    }

    return value
  }

  cloneSetValue (a, b) {
    this.setValue({ ...b, value: this.clone(a) })
  }

  moveValue (from, to) {
    if (this.virtual) {
      throw new Error('Cannot move value of virtual field')
    }
    from = from.properties || (from.row && from.row.properties)
    to = to.properties || (to.row && to.row.properties)

    if (AsyncValue.is(to[this.name])) {
      to[this.name].decrementReference()
    }
    Vue.set(to, this.name, from[this.name])
    from[this.name] = null
  }

  val2str (value) {
    return Field.toString(value)
  }

  input2val (value) {
    return value
  }

  // data representation
  str (data) {
    return this.val2str(this.getValue(data))
  }

  repr (data) {
    return this.getValue(data)
  }

  tableValue (data) {
    return this.str(data)
  }

  popupValue (data) {
    // SECURITY: BE AWARE OF XSS
    return this.str(data)
  }

  formWidget () {
    return DefaultWidget
  }

  search (value) {
    return [ this.name + '__icontains', value ]
  }

  // Defining onUpdate make the field logic on edits.
  // Don't do it if you don't need it.

  // onUpdate (field, value, properties, callback) {}
  // relatedFields () { return [...] }

  rules (t) {
    return [
      value => this.null || (value !== null && value !== undefined) || t('tools.data.requiredField')
    ]
  }

  isValid (data, t) {
    const value = this.getValue(data)
    if (MultiResult.is(value)) {
      return true
    }

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
