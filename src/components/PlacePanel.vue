<template>
  <div class="panel">
    <p class="panel-title">{{ result.title }}</p>

    <div v-if="result">
      {{ properties.adreca }}
    </div>
  </div>
</template>

<script>
import L from 'leaflet'

import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/spinner'

import BaseResultMixin from './BaseResultMixin.js'

export default {
  mixins: [BaseResultMixin],
  components: {
    Icon
  },
  props: ['map'],
  computed: {
    properties () {
      if (this.result.geojson) {
        return this.result.geojson.properties
      } else {
        return {}
      }
    },
    isResultClickable () {
      return this.result.geojson
    }
  },
  methods: {
    viewResult () {
      if (!this.isResultClickable) {
        console.log('Result is not clickable')
        return
      }

      let element = this.result
      if (!element.geojson) {
        console.log('Result is not Geojson')
        return
      }
      if (!('type' in element.geojson && element.geojson['type'] === 'Feature')) {
        console.log('Result is not Feature')
        return
      }

      let sidebar = this.$parent.$refs.sidebar
      var mapBounds = this.map.getBounds()
      let west = mapBounds.getWest()
      let east = mapBounds.getEast()
      let sidebarCover = (east - west) * sidebar.clientWidth / this.map._container.clientWidth
      // mapBounds without the area covered by the sidebar
      mapBounds = L.latLngBounds([
        [mapBounds.getSouthWest().lat, mapBounds.getSouthWest().lng + sidebarCover],
        [mapBounds.getNorthEast().lat, mapBounds.getNorthEast().lng]
      ])

      let visible
      let latLng
      let geom = element.geojson.geometry
      var diff = 0

      if (sidebar.clientWidth !== this.map._container.clientWidth) {
        diff = sidebarCover / 2
      }

      if (geom.type === 'Feature') {
        console.error('FEATURE', element)
      } else if (geom.type === 'Polygon') {
        var polygon = L.geoJSON(geom)
        polygon.addTo(this.map)
        // this.map.fitBounds(polygon.getBounds())
        latLng = polygon.getBounds().getCenter()
        latLng.lng = latLng.lng - diff
        visible = false
      } else if (geom.type === 'Point') {
        latLng = L.latLng(
          geom.coordinates[1],
          geom.coordinates[0] - diff)
        let bounds = latLng.toBounds(250)
        visible = mapBounds.contains(bounds)
      }

      if (!visible) {
        this.map.flyTo(latLng)
      }
      element.layer.openPopup()
    }
  }
}
</script>

<style>
.list-group-item {
  min-height: 65px;
}
.panel {
    padding: 0 20px 15px 20px;
}
.panel-title {
  font-size: 1.5em;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  margin-bottom: 10px;
}
</style>
