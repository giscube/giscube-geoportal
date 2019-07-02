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
    return {
      key: this.name,
      value
    }
  }
}
