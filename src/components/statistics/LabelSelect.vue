<template>
<div class="row q-gutter-md">
    <q-select
      class="col-grow"
      :value="scheme"
      @input="$emit('update:scheme', $event)"
      :options="options"
      :label="t('palette')"
      filled
      emit-value
      map-options
    />
  </div>
</template>
<script>
import { QSelect } from 'quasar'

export default {
  props: ['scheme', 'groups'],
  components: {
    QInput,
    QSelect
  },
  data () {
    return {
      options: Object.freeze(
        COLOR_SCHEMES.map(scheme => {
          const palette = scheme.groups[scheme.maxGroups]
          return {
            label: `<div class="palette">${palette.map(colorSpan).join('')}</div>`,
            value: scheme
          }
        })
      )
    }
  },
  methods: {
    t (key) {
      return this.$t('tools.statistics.' + key)
    }
  }
}
</script>