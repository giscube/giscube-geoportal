<template>
  <q-chip
    color="primary"
    text-color="white"
    removable
    :style="'height: ' + chipHeight + 'px; font-size: inherit'"
    @remove="removeLayer(layer)"
  >
    <span v-html="layerText"></span>
    <textarea
      ref="textarea"
      class="draw-message-input"
      :value="layer.sharedMessage"
      @input="onInput"
    ></textarea>
  </q-chip>
</template>

<script>
import { QChip } from 'quasar'
import Vue from 'vue'

export default {
  components: {
    QChip
  },
  props: ['layerText', 'layer'],
  data () {
    return {
      chipHeight: '28'
    }
  },
  mounted () {
    this.resize()
  },
  methods: {
    onInput (event) {
      const value = event.target.value
      Vue.set(this.layer, 'sharedMessage', value)
      this.layer.bindPopup(value)
      this.resize()
    },
    resize () {
      if (this.$refs.textarea) {
        const baseHeight = 21
        const baseChipHeight = 28
        const textareaHeight = this.$refs.textarea.scrollHeight

        const adjustedHeight = baseChipHeight + (textareaHeight - baseHeight) / baseHeight * baseHeight

        this.chipHeight = Math.max(baseChipHeight, adjustedHeight)
        this.$refs.textarea.style.height = `${textareaHeight}px`
      }
    },
    removeLayer (layer) {
      this.$emit('remove', layer)
    }
  }
}
</script>

<style>
.draw-message-input {
  border: 1px solid transparent;
  background-color: rgba(255, 255, 255, 0.2);
  height: 1ch;
  margin: auto 1ch;
  padding: 0 1ch;
  color: inherit !important;
  border-radius: 10px;
  resize: none;
  min-height: 21px;
  width: 100%;
}
.draw-message-input:focus {
  outline: none;
  box-shadow: none;
}
</style>
