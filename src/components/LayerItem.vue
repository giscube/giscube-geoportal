<template>
  <li @click="$emit('toggle-layer', layer)">
    <a class="toggleLayer"
       ><icon v-if="layer.visible" name="check-square-o" label="selected"></icon>
        <icon v-if="!layer.visible" name="square-o" label="selected"></icon></a>
    <a class="label">{{ layer.name }}</a>
    <a v-if="showActions"
       @click="$emit('remove-layer', layer)" class="removeLayer"
       ><icon name="trash-o" label="selected"></icon></a>
    <a v-if="!showActions && false"
       @click="" class="removeLayer layer-options"
       ><icon name="chevron-down" label="selected"></icon></a>
  </li>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/check-square-o'
import 'vue-awesome/icons/square-o'

export default {
  components: {
    Icon
  },
  props: ['layer', 'map', 'showActions'],
  data () {
    return {}
  }
}
</script>

<style lang="scss">
.giscube-layers-control {
}
</style>
