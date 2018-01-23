<template>
  <div class='popup'>
    <a @click='onClick'>{{ latlng.lat.toFixed(6) }}, {{ latlng.lng.toFixed(6) }}</a>
  </div>
</template>

<script>

export default {
  props: ['latlng'],
  data () {
    return {}
  },
  methods: {
    onClick () {
    }
  }
}
</script>

<style lang="scss">
.popup a {
  cursor: pointer;
}
</style>
