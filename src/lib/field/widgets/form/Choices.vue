<template>
  <q-select
    :readonly="readonly"
    :disable="disable"
    :label="field.label"
    :clearable="field.null"
    :rules="field.rules($t)"
    lazy-rules
    :options="options"
    :value="v"
    :display-value="valuesDict[v]"
    :hint="hint"
    @input="$emit('input', $event ? $event.value : $event)"
  />
</template>

<script>
import MultiResult from '../../../MultiResult.js'
import MultiValueMixin from '../mixins/MultiValueMixin'
import ValidateMixin from '../mixins/ValidateMixin'

export default {
  props: ['value', 'field', 'readonly', 'disable'],
  mixins: [MultiValueMixin, ValidateMixin],
  computed: {
    options () {
      return this.field.valuesList
    },
    valuesDict () {
      return this.field.valuesDict
    },
    hint () {
      if (!MultiResult.is(this.valueObj)) {
        return null
      }

      const cleanValues = this.options.filter(option => this.valueObj.values.has(option.value))

      if (this.valueObj.values.has(null)) {
        cleanValues.push(`<${this.$t('empty value')}>`)
      }

      return `Multiple values: ${cleanValues.join(', ')}`
    }
  }
}
</script>
