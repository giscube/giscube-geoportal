<template>
<div class="q-mb-md">
    <q-select
      filled
      :value="value"
      @input="setOption"
      :options="options"
      :label="t('label')"
      clearable
      emit-value
      map-options
    />
  </div>
</template>
<script>
import { delay } from 'src/lib/utils'
import { QSelect } from 'quasar'

export default {
  props: ['value', 'byOptions'],
  components: {
    QSelect
  },
  computed: {
    options () {
      if (this.byOptions && this.byOptions.length > 0 && this.byOptions[0].feature.properties) {
        return Object.keys(this.byOptions[0].feature.properties).filter(key => key !== 'id')
      } return []
    }
  },
  data () {
    return {}
  },
  methods: {
    async setOption (key) {
      if (key) {
        const values = new Map(this.byOptions.map((option) => [option, option.feature.properties[key]]))
        this.$store.dispatch('statistics/setValueLabel', values)
      } else {
        this.$store.dispatch('statistics/setValueLabel', null)
      }
      await delay()
      this.$store.dispatch('statistics/aggregate')
      this.$emit('update:value', key)
    },
    t (key) {
      return this.$t('tools.statistics.' + key)
    }
  }
}
</script>
