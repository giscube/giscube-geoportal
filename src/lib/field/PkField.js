import Vue from 'vue'

import Field from './Field'

export default class PkField extends Field {
  val2str (value) {
    if (typeof value === 'string' && value.startsWith('__new')) {
      const n = Vue.prototype.$t('states.new')
      return `(${n})`
    } else {
      return value ? value.toString() : null
    }
  }

  search (value) {
    return {
      key: this.name,
      value
    }
  }
}
