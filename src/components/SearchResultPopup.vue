<template>
  <div>
    <div class="result">
      {{ properties.title }}
    </div>
    <div class="tools" v-if="properties">
      <!-- FIXME: use q-btn -->
      <div class="tool-remove-result"
          @click="_removeResult"><q-icon name="delete" /></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResultPopup',
  props: ['feature'],
  computed: {
    properties () {
      if (this.feature) {
        return this.feature.geojson.properties
      } else {
        return {}
      }
    }
  },
  methods: {
    _removeResult () {
      if (this.feature.layer) {
        this.feature.layer.remove()
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
