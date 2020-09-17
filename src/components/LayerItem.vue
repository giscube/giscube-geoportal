<template>
  <li class="layer-item">
    <div>
      <div class="drag-handle" style="display: flex;">
        <q-checkbox
          :value="layer.visible"
          color="black"
          style="flex-grow: 1;"
          :label="layer.name"
          @input="$emit('toggle-layer', { overlay: layer, visible: $event })"
        />
        <q-btn
          flat
          dense
          round
          size="small"
          @click.stop="openLayer(layer)"
          class="desktop-only"
        ><q-icon name="info" size="20px" /></q-btn>
        <q-btn
          flat
          round
          icon="info"
          @click.stop="openLayer(layer)"
          class="desktop-hide"
        />
        <q-btn
          flat
          round
          @click="$emit('remove-layer', { overlay: layer, isOpen: panelOpen })"
          class="desktop-only"
        ><q-icon name="delete" size="20px" /></q-btn>
        <q-btn
          flat
          round
          icon="delete"
          @click="$emit('remove-layer', { overlay: layer, isOpen: panelOpen })"
          class="desktop-hide"
        />
        <q-btn
          v-if="$config.layersControl.itemPanel"
          flat
          round
          icon="keyboard_arrow_down"
          @click="panelClick"
        />
      </div>

      <div v-show="panelOpen" class="layerinfo">
        <span>{{ $t('names.opacity') | capitalize }}</span>
        <q-slider
          :min="0"
          :max="1"
          :step="0"
          :value="layer.opacity"
          @input="$emit('change-opacity', { overlay: layer, value: $event })"
        />
      </div>
    </div>
  </li>
</template>

<script>
import { QBtn, QCheckbox, QIcon, QSlider } from 'quasar'

export default {
  props: ['layer', 'map', 'showActions'],
  components: {
    QBtn,
    QCheckbox,
    QIcon,
    QSlider
  },
  data () {
    return {
      panelOpen: false
    }
  },
  methods: {
    panelClick () {
      this.panelOpen = !this.panelOpen
      this.$emit('panel-open', this.panelOpen)
    },
    openLayer (layer) {
      if (layer && layer.id && layer.id.canOpen && layer.id.canOpen()) {
        this.$store.dispatch('openReference', layer)
      }
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
  .q-checkbox__label, .q-btn {
    font-size: 12px;
  }
}
</style>
