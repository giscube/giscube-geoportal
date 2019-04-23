<template>
  <div>
    <q-resize-observer @resize="onResize" :debounce="0" />
    <div v-if="result && !resultIsError" v-html="result" style="min-width: 100%"></div>
    <div v-else-if="!result">
      <table class="table table-striped table-hover">
        <tbody>
          <tr v-for='(value, name) in feature.properties' class='attr' :key="name">
            <th>{{ name }}</th>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-negative text-h6">{{ $t('badPopupConfig') }}</div>
  </div>
</template>

<script>
export default {
  props: ['feature', 'renderContents'],
  computed: {
    result () {
      try {
        return this.renderContents && this.renderContents(this.feature.properties)
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
