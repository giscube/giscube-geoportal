import MultiResult from '../../../MultiResult'

export default {
  computed: {
    rules () {
      return this.field && this.field.rules(this.$t.bind(this))
    }
  },
  methods: {
    validate () {
      if (MultiResult.is(this.value)) {
        return true
      }
      this.$children[0].validate()
      return !this.$children[0].hasError
    },
    resetValidation () {
      this.$children[0].resetValidation()
    }
  }
}
