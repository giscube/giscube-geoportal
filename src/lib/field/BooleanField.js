import Field from './Field'
import BooleanWidget from './widgets/form/Boolean'

export default class BooleanField extends Field {
  tableValue (feature) {
    const value = this.getValue(feature)
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
}
