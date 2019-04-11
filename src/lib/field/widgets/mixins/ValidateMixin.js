import MultiResult from '../../../MultiResult'

export default {
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
