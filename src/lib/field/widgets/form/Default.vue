<template>
  <validated-input
    :readonly="readonly"
    :disable="disable"
    :label="field.label | capitalize"
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
  props: ['value', 'field', 'readonly', 'disable'],
  mixins: [MultiValueMixin, ValidateMixin],
  components: {
    ValidatedInput
  }
}
</script>
