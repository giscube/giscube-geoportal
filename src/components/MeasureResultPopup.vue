<template>
  <div>
    <div v-if="measure" class="result">
      <div v-if="measure.type === 'path'" class="">{{ measure.length }} {{ $t('units.' + measure.units) }}</div>
      <div v-if="measure.type === 'area'" class="">{{ measure.area }} {{ $t('units.' + measure.units) }}<sup>2</sup></div>
    </div>
    <div class="tools" v-if="measure">
      <!-- FIXME: use q-btn -->
      <div class="tool-remove-result"
          @click="_removeResult"><q-icon name="delete" /></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MeasureResultPopup',
  props: ['measure'],
  methods: {
    _removeResult () {
      if (this.measure.layer) {
        this.measure.layer.remove()
      }
    }
  }
}
</script>

<style scoped>
.result {
  margin-top: 20px;
  font-weight: bold;
}
.tools {
  border-top: 1px dashed #ddd;
  margin-top: 10px;
  padding: 8px 0px 0px 0px;
}
.tool-remove-result {
  font-size: 0.8em;
  text-align: center;
  display: inline-block;
  background-color: #eee;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
