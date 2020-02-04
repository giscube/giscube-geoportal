import Field from './Field'
import NumberWidget from './widgets/form/Number'

export default class NumberField extends Field {
  formWidget () {
    return NumberWidget
  }

  setValue (args) {
    const v = parseFloat(args.value)
    if (!isNaN(v)) {
      args.value = v
    }
    return super.setValue(args)
  }

  search (value) {
    return [ this.name, value ]
  }

  filter (data, filter) {
    if (!filter) {
      return true
    }
    filter = parseInt(filter, 10)
    const value = this.getValue(data)
    return !Number.isNaN(filter) && value === filter
  }
}
