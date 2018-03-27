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

      let mapInfo = this.map.giscube.getMapInfo()
      let visible
      let latLng
      let geom = element.geojson.geometry
      let diff = mapInfo.coveredLng / 2

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
        var point = L.latLng(
          geom.coordinates[1],
          geom.coordinates[0])
        let bounds = point.toBounds(
          Math.min(mapInfo.visibleHeightMeters, mapInfo.visibleWidthMeters) * .5)

        visible = mapInfo.visibleBounds.contains(bounds)
        if (mapInfo.isVisible) {
          latLng = L.latLng(
            geom.coordinates[1],
            geom.coordinates[0] - diff)
        } else {
          latLng = point
        }
      }

      if (!visible || !mapInfo.isVisible) {
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
