import Vue from 'vue'

import Field from './Field'

export default class PkField extends Field {
  tableValue (data) {
    const value = this.getValue(data)

    if (typeof value === 'string' && value.startsWith('__new')) {
      const n = Vue.prototype.$t('new')
      return `(${n})`
    } else {
      return value ? value.toString() : null
    }
  }
}
