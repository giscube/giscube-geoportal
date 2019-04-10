import MultiResult from '../../../MultiResult.js'

function compare (a, b) {
  if (a === null) {
    return 1
  } else if (b === null) {
    return -1
  } else if (typeof a === 'number') {
    return a - b
  } else if (typeof a === 'string') {
    return a.localeCompare(b)
  } else {
    return compare(this.field.val2str(a), this.field.val2str(b))
  }
}

export default {
  computed: {
    valueObj () {
      return this.value
    },
    isMulti () {
      return MultiResult.is(this.valueObj)
    },
    v () {
      return this.isMulti ? null : this.valueObj
    },
    hint () {
      if (!this.isMulti) {
        return null
      }

      const cleanValues = Array.from(this.valueObj.values)
        .sort(compare)
        .map(value => (value || `<${this.$t('empty value')}>`))

      return `Multiple values: ${cleanValues.join(', ')}`
    }
  }
}
