
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

  str (data) {
    const valueId = this.getValue(data)
    const value = valueId && this.valuesDict[valueId]
    return Field.toString(value && value[1])
  }

  repr (data) {
    const value = this.getValue(data)
    return this.valuesDict[value][0]
  }

  formWidget () {
    return SqlChoicesWidget
  }
}
