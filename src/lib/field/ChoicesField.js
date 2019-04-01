import Field from './Field'
import ChoicesWidget from './widgets/form/Choices'

export default class ChoicesField extends Field {
  tableValue (feature) {
    const value = this.getValue(feature)
    return this.valuesDict[value]
  }

  formWidget () {
    return ChoicesWidget
  }
}
