<template>
  <li>
    <div class="flex-nowrap-start link" @click="$emit('toggle-layer', layer)">
      <a class="flex-icon"
         ><icon v-if="layer.visible" name="check-square" label="selected"></icon>
          <icon v-if="!layer.visible" name="square" label="selected"></icon></a>
      <a class="flex-label">{{ layer.name }}</a>
      <a @click.stop="$emit('remove-layer', layer)"
         class="flex-icon visible-on-hover hover-invert"
         ><icon name="trash" label="selected"></icon></a>
      <a @click.stop="panelOpen = !panelOpen" class="flex-icon gray-svg hover-invert"
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
import 'vue-awesome/icons/check-square'
import 'vue-awesome/icons/square'

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
      if (this.layer.layer.setOpacity) {
        this.layer.layer.setOpacity(value / 100.0)
      }
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
    border-bottom: 1px dashed #ccc;
  }

  .opacity {
  }
}
</style>
