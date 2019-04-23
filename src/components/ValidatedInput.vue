<script>
import { QInput } from 'quasar'

export default {
  mixins: [QInput],
  methods: {
    validate (value = this.value) {
      const input = this.$refs.input

      if (!input.checkValidity()) {
        this.innerError = true
        this.innerErrorMessage = input.validationMessage
        if (this.innerLoading !== false) {
          this.innerLoading = false
        }
        return true
      }

      return QInput.options.methods.validate.apply(this, arguments)
    }
  }
}
</script>

<style>
:invalid {
  /* Firefox adds a shadow by default */
  box-shadow: none;
}
</style>
