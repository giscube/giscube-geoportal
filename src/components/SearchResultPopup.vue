<template>
  <div>
    <div class="result">
      {{ properties.title }}
    </div>
    <div class="tools" v-if="properties">
      <q-btn flat dense
        icon="delete"
        @click="_removeResult"
      />
    </div>
  </div>
</template>

<script>
import { QBtn } from 'quasar'

export default {
  name: 'SearchResultPopup',
  props: ['feature'],
  components: {
    QBtn
  },
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
