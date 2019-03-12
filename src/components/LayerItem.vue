<template>
  <li>
    <div>
      <div class="drag-handle" style="display: flex;">
        <q-checkbox
          v-model="layer.visible"
          :label="layer.name"
          style="flex-grow: 1;"
          @input="$emit('toggle-layer', { options: layer, visible: $event })"
        />
        <q-btn
          flat
          round
          icon="delete"
          @click="$emit('remove-layer', layer)"
        />
        <q-btn
          flat
          round
          icon="keyboard_arrow_down"
          @click="panelOpen = !panelOpen"
        />
      </div>

      <div v-show="panelOpen" class="layerinfo">
        <span>Opacitat:</span>
        <q-slider
          :min="0"
          :max="1"
          :step="0"
          v-model="opacity"
          @input="$emit('change-opacity', { options: layer, value: $event })"
        />
      </div>
    </div>
  </li>
</template>

<script>
export default {
  props: ['layer', 'map', 'showActions'],
  data () {
    return {
      panelOpen: false,
      opacity: 1
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
}
</style>
