
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
    const key = this.getValue(data)
    const v = data && this.valuesDict[key]
    if (v === void 0) {
      return Field.toString(key)
    }
    const value = v && v[1]
    return Field.toString(value === void 0 ? v : value)
  }

  repr (data) {
    const value = this.getValue(data)
    return this.valuesDict[value][0]
  }

  formWidget () {
    return SqlChoicesWidget
  }
}
