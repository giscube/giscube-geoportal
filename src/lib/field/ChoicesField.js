import Field from './Field'
import ChoicesWidget from './widgets/form/Choices'

export default class ChoicesField extends Field {
  constructor (info) {
    super(info)

    this.valuesList = []
    this.valuesDict = {}

    const valuesList = info.values_list
    if (Array.isArray(valuesList)) {
      for (let value of valuesList) {
        if (Array.isArray(value)) {
          this.valuesDict[value[0]] = value[1]
          this.valuesList.push({ value: value[0], label: value[1] })
        } else {
          this.valuesDict[value] = value
          this.valuesList.push({ value, label: value })
        }
      }
    }
  }

  tableValue (feature) {
    const value = this.getValue(feature)
    return this.valuesDict[value]
  }

  formWidget () {
    return ChoicesWidget
  }
}
