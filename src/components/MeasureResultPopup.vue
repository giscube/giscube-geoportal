<template>
  <div>
    <div v-if="measure" class="result">
      <div v-if="measure.type === 'path'" class="">{{ measure.length }} {{ measure.units }}</div>
      <div v-if="measure.type === 'area'" class="">{{ measure.area }} {{ measure.units }}<sup>2</sup></div>
    </div>
    <div class="tools" v-if="measure">
      <div class="tool-remove-result"
          @click="_removeResult"><icon name="trash-o" label="selected"></icon></div>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/trash-o'

export default {
  name: 'MeasureResultPopup',
  components: {
    Icon
  },
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
