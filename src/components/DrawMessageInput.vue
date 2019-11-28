<template>
  <input
    class="draw-message-input q-field__native"
    :value="layer.sharedMessage"
    @input="onInput"
  />
</template>

<script>
import Vue from 'vue'

export default {
  props: ['layer'],
  methods: {
    onInput (event) {
      const value = event.target.value
      Vue.set(this.layer, 'sharedMessage', value)
      this.layer.bindPopup(value)
    }
  }
}
</script>

<style>
.draw-message-input {
  background-color: rgba(255, 255, 255, 0.2);
  height: 1.5em;
  margin: auto 1ch;
  padding: 0 1ch;
  color: inherit !important;
  border-radius: 10px;
}
</style>
