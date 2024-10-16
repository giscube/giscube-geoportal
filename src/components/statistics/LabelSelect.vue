<template>
<div class="q-mb-md">
    <q-select
      filled
      :value="value"
      @input="$emit('update:value', $event)"
      :options="options"
      :label="t('label')"
      clearable
    />
  </div>
</template>
<script>
import { QSelect } from 'quasar'

export default {
  props: ['value', 'byOptions'],
  components: {
    QSelect
  },
  data () {
    return {
      options: this.byOptions.map(option => option.name)
    }
  },
  methods: {
    t (key) {
      return this.$t('tools.statistics.' + key)
    }
  }
}
</script>
