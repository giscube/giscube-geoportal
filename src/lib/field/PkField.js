import Vue from 'vue'

import Field from './Field'

export default class PkField extends Field {
  tablevalue (value) {
    if (typeof value === 'string' && value.startsWith('__new')) {
      const n = Vue.prototype.$t('new')
      return `(${n})`
    } else {
      return value.toString()
    }
  }
}
