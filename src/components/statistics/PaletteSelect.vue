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
    <q-input
      label="Groups"
      type="number"
      :min="scheme ? scheme.minGroups : 3"
      :max="scheme ? scheme.maxGroups : 9"
      :value="groups"
      @input="$emit('update:groups', $event)"
    />
  </div>
</template>

<script>
import { QInput, QSelect } from 'quasar'
import { COLOR_SCHEMES } from 'src/store/module-statistics/constants'

const colorSpan = color => `<span style="background-color: ${color}"></span>`
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

<style>
.palette {
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
}
.q-field__control-container .palette {
  margin-top: 0.5em;
}

.palette > span {
  height: 1.25em;
  width: 1.25em;
}
</style>
