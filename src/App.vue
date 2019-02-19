<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import L from 'leaflet'
require('../node_modules/leaflet/dist/leaflet.css')

// FIX leaflet's default icon path problems with webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  name: 'App',
  data () {
    return {
      counter: 0
    }
  },
  methods: {

  }
}
</script>

<style>
</style>
