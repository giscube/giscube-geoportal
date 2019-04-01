import MultiResult from '../../../MultiResult.js'

export default {
  computed: {
    valueObj () {
      return this.value
    },
    v () {
      return MultiResult.is(this.valueObj) ? null : this.valueObj
    },
    hint () {
      if (!MultiResult.is(this.valueObj)) {
        return null
      }

      const cleanValues = [...this.valueObj.values]
        .sort((a, b) => {
          if (a === null) {
            return 1
          } else if (b === null) {
            return -1
          } else if (typeof a === 'number' && typeof b === 'number') {
            return a - b
          } else {
            return a.toString().localeCompare(b.toString())
          }
        })
        .map(value => (value || `<${this.$t('empty value')}>`))

      return `Multiple values: ${cleanValues.join(', ')}`
    }
  }
}
