<template>
  <div class='popup'>
    <div class='title'>Latitude, Longitude</div>
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
.popup .title {
  font-size: 1.2em;
  font-weight: bold;
  min-width: 200px;
  margin-bottom: 8px;
}
</style>
