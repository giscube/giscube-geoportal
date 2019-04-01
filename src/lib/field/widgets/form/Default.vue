<template>
  <q-input
    :readonly="readonly"
    :disable="disable"
    :label="field.label"
    :clearable="field.null"
    :rules="field.rules($t)"
    lazy-rules
    :value="v"
    :hint="hint"
    @input="$emit('input', $event)"
  />
</template>

<script>
import MultiValueMixin from '../mixins/MultiValueMixin'
import ValidateMixin from '../mixins/ValidateMixin'

export default {
  props: ['value', 'field', 'readonly', 'disable'],
  mixins: [MultiValueMixin, ValidateMixin]
}
</script>
