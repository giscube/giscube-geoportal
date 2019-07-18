<template>
  <validated-input
    type="number"
    :readonly="readonly"
    :disable="disable"
    :label="field.label"
    :clearable="field.null"
    :rules="rules"
    lazy-rules
    :value="v"
    :hint="hint"
    :max="max"
    @input="$emit('input', $event)"
  />
</template>

<script>
import ValidatedInput from 'components/ValidatedInput'
import MultiValueMixin from '../mixins/MultiValueMixin'
import ValidateMixin from '../mixins/ValidateMixin'

export default {
  props: ['value', 'field', 'readonly', 'disable'],
  mixins: [MultiValueMixin, ValidateMixin],
  components: {
    ValidatedInput
  },
  computed: {
    max () {
      if (this.field.size === undefined || this.field.size === null) {
        return Infinity
      } else {
        const s = this.field.size
        const d = this.field.decimals || 0
        return Math.pow(10, s - d) - Math.pow(10, -d)
      }
    }
  }
}
</script>
