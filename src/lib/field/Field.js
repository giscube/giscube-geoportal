import Vue from 'vue'

import DottedPath from '../DottedPath'
import { AsyncJob } from '../async'
import MultiResult from '../MultiResult'
import { cloneClean, isCleanEqual, isVoid, regexEscape } from '../utils.js'

import DefaultFormWidget from './widgets/form/Default'
import DefaultFilterComponent from './components/filter/Default'

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

  getValue ({ row, properties, from, value }) {
    if (value !== void 0) {
      return value
    }
    return this.path.extractFrom(from || properties || (row && row.properties) || void 0)
  }

  setValue ({ row, properties, value }) {
    if (this.virtual && !this.hasCacheValue) {
      throw new Error('Cannot set value of virtual field')
    }
    const props = properties || (row && row.properties)
    if (props) {
      if (AsyncJob.is(value)) {
        value.incrementReference()
      }
      if (AsyncJob.is(props[this.name])) {
        props[this.name].decrementReference()
      }
      this.path.setTo(props, value, Vue.set)
    }
  }

  equals (a, b) {
    const av = this.getValue(a)
    const bv = this.getValue(b)

    if (AsyncJob.is(av) !== AsyncJob.is(bv)) {
      return false
    } else if (AsyncJob.is(av)) {
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
    if (AsyncJob.is(value)) {
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

    if (AsyncJob.is(to[this.name])) {
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
    return DefaultFormWidget
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

  _compareValue (va, vb) {
    if (Number.isFinite(va) && Number.isFinite(vb)) {
      return vb - va
    }

    const toString = this.constructor.toString
    return toString(va).localeCompare(toString(vb))
  }

  compare (a, b, descending, voidsPosition) {
    const desc = descending ? -1 : 1
    const compareVoid = voidsPosition !== 'first' ? -1 : 1

    const va = this.getValue(b)
    const vb = this.getValue(a)

    {
      const isAEmpty = isVoid(va) || va === ''
      const isBEmpty = isVoid(vb) || vb === ''

      if (isAEmpty && isBEmpty) {
        return 0
      } else if (isAEmpty) {
        return compareVoid
      } else if (isBEmpty) {
        return -compareVoid
      }
    }

    return desc * this._compareValue(va, vb)
  }

  filter (data, filter) {
    const v = this.getValue(data)
    const sv = this.constructor.toString(v)

    let result = true
    if (filter) {
      const regex = new RegExp(regexEscape(filter), 'i')
      result = regex.test(sv)
    }
    return result
  }

  colFilter (data, filter) {
    return this.filter(data, filter)
  }

  filterWidget () {
    return this.formWidget()
  }

  filterComponent () {
    return DefaultFilterComponent
  }

  static toString (value) {
    if (isVoid(value)) {
      return ''
    } else {
      return value.toString()
    }
  }
}
