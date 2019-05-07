<template>
  <div class="panel place-panel">
    <div class="panel-content">
      <p class="panel-title">{{ result.title }}</p>

      <div v-if="result && properties.address" class="row-info">
        <q-icon name="home" size="20px" /> {{ properties.address }}
      </div>

      <div v-if="coordinates" class="row-info">
        <q-icon name="place" size="20px" /> GPS: {{ coordinates }}
      </div>

      <div class="row reverse">
        <q-btn outline no-caps
          icon="zoom_in"
          :label="$t('actions.zoom') | capitalize"
          @click="zoomResult"
        />
      </div>

    </div>
  </div>
</template>

<script>
import { QBtn, QIcon } from 'quasar'
import L from '../lib/leaflet'

import BaseResultMixin from './BaseResultMixin.js'

export default {
  mixins: [BaseResultMixin],
  props: ['map'],
  components: {
    QBtn,
    QIcon
  },
  computed: {
    coordinates () {
      if (this.result.latlng) {
        return this.result.latlng.coordinates[0].toFixed(6) + ', ' + this.result.latlng.coordinates[1].toFixed(6)
      } else {
        return null
      }
    },
    properties () {
      if (this.result.geojson) {
        return this.result.geojson.properties
      } else {
        return {}
      }
    },
    resultsLayer () {
      return this.$store.state.resultsLayer
    },
    isResultClickable () {
      return this.result.geojson
    }
  },
  destroyed () {
    if (this.result.layer) {
      this.result.layer.removeFrom(this.resultsLayer)
      this.$store.commit('selectResult', null)
    }
  },
  methods: {
    isValidResult () {
      if (!this.isResultClickable) {
        // Result is not clickable
        return false
      }

      let element = this.result
      if (!element.geojson) {
        // Result is not Geojson
        return false
      }
      if (!('type' in element.geojson && element.geojson['type'] === 'Feature')) {
        // Result is not Feature
        return false
      }

      return true
    },
    viewResult () {
      if (!this.isValidResult()) {
        return
      }

      let element = this.result
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
        if (!element.layer) {
          element.layer = L.geoJSON.geometryToLayer(geom)
        }
        bounds = element.layer.getBounds().pad(0.1)
      }
      this.resultsLayer.addLayer(element.layer)

      let visible = mapInfo.visibleBounds.contains(bounds)

      if (!visible || !mapInfo.isVisible) {
        this.zoomResult()
      }
      element.layer.openPopup()
    },
    zoomResult () {
      if (!this.isValidResult()) {
        return
      }

      let element = this.result
      let mapInfo = this.map.giscube.getMapInfo()
      let geojson = L.geoJSON(element.geojson.geometry)
      let bounds = geojson.getBounds().pad(0.1)

      this.map.flyToBounds(bounds, {
        paddingTopLeft: [mapInfo.sidebarWidthPx, 0],
        maxZoom: 19
      })
    }
  }
}
</script>

<style lang="scss">
.place-panel {
  .panel-title {
    margin-bottom: 20px;
  }
  .row-info {
    margin-bottom: 15px;
  }
}
</style>
