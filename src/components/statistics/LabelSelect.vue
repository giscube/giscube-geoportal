<template>
<div class="q-mb-md">
    <q-select
      filled
      :value="value"
      @input="$emit('update:value', $event)"
      :options="options"
      :label="t('label')"
      clearable
      emit-value
      map-options
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
      options: this.byOptions.map(option => {
        return {
          label: option.name,
          value: option.url
        }
      })
    }
  },
  methods: {
    t (key) {
      return this.$t('tools.statistics.' + key)
    }
  }
}
</script>
