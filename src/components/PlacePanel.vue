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
      let bounds
      let geom = element.geojson.geometry

      if (geom.type === 'Point') {
        var point = L.latLng(
          geom.coordinates[1],
          geom.coordinates[0])
        bounds = point.toBounds(
          Math.min(mapInfo.visibleHeightMeters, mapInfo.visibleWidthMeters) * 0.5)
      } else {
        let geojson = L.geoJSON(geom)
        geojson.addTo(this.map)
        bounds = geojson.getBounds().pad(0.1)
      }

      let visible = mapInfo.visibleBounds.contains(bounds)

      if (!visible || !mapInfo.isVisible) {
        let latLng = bounds.getCenter()
        // use zoom/pan options in flyTo instead?
        if (mapInfo.isVisible) {
          latLng.lng = latLng.lng - mapInfo.coveredLng / 2
        }

        // do we need a smaller zoom?
        let maxZoom = this.map.getBoundsZoom(bounds)

        if (this.map.getZoom() > maxZoom) {
          this.map.flyTo(latLng, maxZoom)
        } else {
          this.map.flyTo(latLng)
        }
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
