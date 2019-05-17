import Field from './Field'
import BooleanWidget from './widgets/form/Boolean'

export default class BooleanField extends Field {
  tableValue (data) {
    const value = this.getValue(data)
    if (value === true) {
      return '✓'
    } else if (value === false) {
      return '✗'
    } else {
      return ''
    }
  }

  formWidget () {
    return BooleanWidget
  }

  search (value) {
    return {
      key: this.name,
      value
    }
  }
}
