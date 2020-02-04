<template>
  <validated-input
    :readonly="readonly"
    :disable="disable"
    :label="label_"
    :clearable="field.null"
    :rules="rules"
    :mask="field.mask"
    lazy-rules
    :value="v"
    :hint="hint"
    @input="$emit('input', field.input2val($event))"
  />
</template>

<script>
import ValidatedInput from 'components/ValidatedInput'
import MultiValueMixin from '../mixins/MultiValueMixin'
import ValidateMixin from '../mixins/ValidateMixin'

export default {
  props: ['value', 'field', 'readonly', 'disable', 'label'],
  mixins: [MultiValueMixin, ValidateMixin],
  components: {
    ValidatedInput
  },
  computed: {
    label_ () {
      return this.label || this.$filter('capitalize')(this.field.label)
    }
  }
}
</script>
