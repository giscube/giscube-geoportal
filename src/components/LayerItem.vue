<template>
  <li>
    <div class="layeritem" @click="$emit('toggle-layer', layer)">
      <a class="toggleLayer"
         ><icon v-if="layer.visible" name="check-square-o" label="selected"></icon>
          <icon v-if="!layer.visible" name="square-o" label="selected"></icon></a>
      <a class="label">{{ layer.name }}</a>
      <a v-if="showActions"
         @click.stop="$emit('remove-layer', layer)" class="removeLayer"
         ><icon name="trash-o" label="selected"></icon></a>
      <a v-if="!showActions"
         @click.stop="panelOpen = !panelOpen" class="removeLayer layer-options"
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
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/check-square-o'
import 'vue-awesome/icons/square-o'

Vue.use(ElementUI)

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
