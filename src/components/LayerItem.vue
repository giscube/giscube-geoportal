<template>
  <li>
    <div class="flex-nowrap-start link" @click="$emit('toggle-layer', layer)">
      <a class="flex-icon"
         ><icon v-if="layer.visible" name="check-square-o" label="selected"></icon>
          <icon v-if="!layer.visible" name="square-o" label="selected"></icon></a>
      <a class="flex-label">{{ layer.name }}</a>
      <a v-if="showActions"
         @click.stop="$emit('remove-layer', layer)" class="flex-icon hover-invert"
         ><icon name="trash-o" label="selected"></icon></a>
      <a v-if="!showActions"
         @click.stop="panelOpen = !panelOpen" class="flex-icon gray-svg hover-invert"
         ><icon name="chevron-down" label="selected"></icon></a>
     </div>
     <div v-show="panelOpen" class="layerinfo">
       <div class="opacity">
         <span>Opacitat:</span>
         <el-slider v-model="opacity" @input="opacityChanged"></el-slider>
       </div>
     </div>
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
    return {
      panelOpen: false,
      opacity: 100
    }
  },
  methods: {
    opacityChanged (value) {
      this.layer.layer.setOpacity(value / 100.0)
    }
  }
}
</script>

<style lang="scss">
.giscube-layers-control {
  .layerinfo {
    padding: 10px 20px;
    width: 100%;
    background-color: #eee;
  }

  .opacity {
  }
}
</style>
