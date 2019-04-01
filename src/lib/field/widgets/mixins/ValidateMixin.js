export default {
  methods: {
    validate () {
      this.$children[0].validate()
      return !this.$children[0].hasError
    },
    resetValidation () {
      this.$children[0].resetValidation()
    }
  }
}
