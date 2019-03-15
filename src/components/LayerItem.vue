<template>
  <li class="layer-item">
    <div>
      <div class="drag-handle" style="display: flex;">
        <q-checkbox
          v-model="layer.visible"
          :label="layer.name"
          color="black"
          style="flex-grow: 1;"
          @input="$emit('toggle-layer', { options: layer, visible: $event })"
        />
        <q-btn
          flat
          round
          @click="$emit('remove-layer', layer)"
          class="desktop-only"
        ><q-icon name="delete" size="20px" /></q-btn>
        <q-btn
          flat
          round
          icon="delete"
          @click="$emit('remove-layer', layer)"
          class="desktop-hide"
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
.layer-item {
  .desktop-only {
    color: transparent;
  }
  &:hover .desktop-only {
    color: black;
  }

  .layerinfo {
    padding: 10px 20px;
    width: 100%;
    background-color: #eee;
    border-bottom: 1px dashed #ccc;
  }
  .q-checkbox__inner {
    width: 34px;
    min-width: 34px;
    height: 34px;
  }
  .q-checkbox__bg {
    left: 10px;
    top: 10px;
  }
  .q-checkbox__label {
    font-size: 12px;
  }
  .q-btn--round {
    height: 38px;
    min-height: 38px;
    width: 38px;
    min-width: 38px;
  }
}
</style>
