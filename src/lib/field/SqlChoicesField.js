import template from 'lodash/template.js'

import { strContains } from 'src/lib/utils'

import Field from './Field'
import SqlChoicesWidget from './widgets/form/SqlChoices'

export default class SqlChoicesField extends Field {
  constructor (info) {
    super(info)

    const options = info.widget_options

    if (options.label) {
      this.strTemplate = template(options.label, {
        escape: null,
        interpolate: /{([\s\S]+?)}/g,
        evaluate: null
      })
    }

    this.headers = options.values_list_headers
    this.valuesList = options.values_list

    this.tableHeaders = options.table_headers.map(col => {
      const name = Object.keys(col)[0]
      return {
        name,
        i: this.headers.indexOf(name),
        label: col[name]
      }
    })

    this.valuesDict = {}
    this.valuesList.forEach(value => { this.valuesDict[value[0]] = value })
  }

  str (data) {
    const key = this.getValue(data)
    let v = data && this.valuesDict[key]

    if (v === void 0) {
      return Field.toString(key)
    } else if (this.strTemplate) {
      v = v || {}
      const values = {}
      this.headers.forEach((col, i) => {
        values[col] = v[i] || ''
      })
      return this.strTemplate(values)
    } else {
      const value = v && v[1]
      return Field.toString(value === void 0 ? v : value)
    }
  }

  repr (data) {
    const value = this.getValue(data)
    const repr = this.valuesDict[value]
    return repr && repr[0]
  }

  formWidget () {
    return SqlChoicesWidget
  }

  search (value) {
    const choices = this.valuesList
      .filter(
        row => this.tableHeaders.some(
          ({ i }) => strContains(row[i], value)
        )
      )
      .map(row => JSON.stringify(row[0]))
      .join(',')

    return [ this.name + '__in', choices ]
  }
}
