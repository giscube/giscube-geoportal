
import Field from './Field'
import SqlChoicesWidget from './widgets/form/SqlChoices'

export default class SqlChoicesField extends Field {
  constructor (info) {
    super(info)

    this.headers = info.values_list_headers
    this.valuesList = info.values_list

    this.valuesDict = {}
    this.valuesList.forEach(value => { this.valuesDict[value[0]] = value })
  }

  str (feature) {
    const valueId = this.getValue(feature)
    const value = valueId && this.valuesDict[valueId][1]
    return Field.toString(value)
  }

  repr (feature) {
    const value = this.getValue(feature)
    return this.valuesDict[value][0]
  }

  formWidget () {
    return SqlChoicesWidget
  }
}
