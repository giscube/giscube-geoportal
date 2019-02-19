<template>
  <div>
    <div class="result">
      {{ properties.title }}
    </div>
    <div class="tools" v-if="properties">
      <div class="tool-remove-result"
          @click="_removeResult"><icon name="trash" label="selected"></icon></div>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/trash'

export default {
  name: 'SearchResultPopup',
  components: {
    Icon
  },
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
