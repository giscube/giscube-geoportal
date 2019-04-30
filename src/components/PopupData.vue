<template>
  <div>
    <q-resize-observer @resize="onResize" :debounce="0" />
    <div v-if="result && !resultIsError" v-html="result" style="min-width: 100%"></div>
    <div v-else-if="!result">
      <table class="table table-striped table-hover">
        <tbody v-if="fields">
          <tr v-for='field in fields' class='attr' :key="field.name">
            <th>{{ field.name }}</th>
            <td>{{ field.popupValue(feature) }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for='(value, name) in feature.properties' class='attr' :key="name">
            <th>{{ name }}</th>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-negative text-h6">{{ $t('messages.badPopupConfig') }}</div>
  </div>
</template>

<script>
export default {
  props: ['feature', 'fields', 'renderContents'],
  computed: {
    result () {
      try {
        if (!this.renderContents) {
          return false
        } else if (this.fields) {
          const values = {}
          this.fields.forEach(field => {
            values[field.name] = field.popupValue(this.feature)
          })
          return this.renderContents(values)
        } else {
          return this.renderContents(this.feature.properties)
        }
      } catch (e) {
        console.error('Bad popup template\'s configuration')
        console.error(e)
        return e
      }
    },
    resultIsError () {
      return this.result instanceof Error
    }
  },
  updated () {
    this.$nextTick(_ => this.onResize())
  },
  methods: {
    onResize () {
      this.$parent.$emit('updatePopupSize')
    }
  }
}
</script>
