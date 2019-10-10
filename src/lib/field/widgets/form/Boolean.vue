<template>
  <q-select
    :readonly="readonly"
    :disable="disable"
    :label="field.label | capitalize"
    :clearable="field.null"
    :rules="rules"
    lazy-rules
    :options="[
      { label: this.$t('no'), value: false },
      { label: this.$t('yes'), value: true }
    ]"
    :value="v"
    :hint="hint"
    @input="$emit('input', $event ? $event.value : $event)"
  />
</template>

<script>
import { QSelect } from 'quasar'

import MultiValueMixin from '../mixins/MultiValueMixin'
import ValidateMixin from '../mixins/ValidateMixin'

export default {
  props: ['value', 'field', 'readonly', 'disable'],
  mixins: [MultiValueMixin, ValidateMixin],
  components: {
    QSelect
  },
  computed: {
    v () {
      if (this.valueObj === true) {
        return { label: this.$t('yes'), value: true }
      } else if (this.valueObj === false) {
        return { label: this.$t('no'), value: false }
      }
      return null
    }
  }
}
</script>
