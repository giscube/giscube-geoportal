<template>
  <q-select
    :readonly="readonly"
    :disable="disable"
    :label="field.label"
    :clearable="field.null"
    :rules="rules"
    lazy-rules
    :options="options"
    :value="v"
    :display-value="valuesDict[v]"
    :hint="hint"
    @input="$emit('input', $event ? $event.value : $event)"
  />
</template>

<script>
import { QSelect } from 'quasar'

import MultiResult from '../../../MultiResult.js'
import MultiValueMixin from '../mixins/MultiValueMixin'
import ValidateMixin from '../mixins/ValidateMixin'

export default {
  props: ['value', 'field', 'readonly', 'disable'],
  mixins: [MultiValueMixin, ValidateMixin],
  components: {
    QSelect
  },
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

      const cleanValues = this.options.filter(option => this.valueObj.values.has(option.value)).map(option => option.value)

      if (this.valueObj.values.has(null)) {
        cleanValues.push(`<${this.$t('values.empty')}>`)
      }

      return `Multiple values: ${cleanValues.join(', ')}`
    }
  }
}
</script>
