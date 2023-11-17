<template>
  <div class="panel">
    <div class="panel-content">
      <p class="panel-title">{{ t('title') }}</p>

      <p v-if="!measureCircle">{{ t('explanation') }}</p>
      <div v-if="measureCircle">
        {{ t('explanationCircle') }}
        <q-input filled dense v-model="radius" :label="t('radius') + ' (m)'" class="q-pt-sm q-pb-md" debounce="700" />
      </div>

      <div class="row space-items-md">
        <q-btn-group class="no-shadow">
          <q-btn
            icon="place"
            v-show="!measuring"
            @click="addMeasure('point')"
          >
            <q-tooltip>
              {{ t('marker') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            icon="timeline"
            v-show="!measuring"
            @click="startMeasuring(false)"
          >
            <q-tooltip>
              {{ t('path') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            icon="fas fa-draw-polygon"
            v-show="!measuring"
            @click="startMeasuring(true)"
          >
            <q-tooltip>
              {{ t('area') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            icon="far fa-dot-circle"
            v-show="!measuring"
            @click="addMeasure('circle')"
          >
            <q-tooltip>
              {{ t('circle') }}
            </q-tooltip>
          </q-btn>
          <q-btn-dropdown v-show="!measuring" icon="save_alt">
            <q-list>
              <q-item clickable v-close-popup @click="download('geojson')">
                <q-item-section style="width: 140px">
                  <q-item-label>{{ $t('actions.download') | capitalize }} GeoJSON</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="download('dxf')">
                <q-item-section>
                  <q-item-label>{{ $t('actions.download') | capitalize }} DXF</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-btn-group>
        <q-btn
          outline
          v-show="measuring"
          @click="stopMapMeasuring"
        >
          {{ t('stop') }}
        </q-btn>
      </div>

      <div class="q-pt-md">
        <q-item tag="label" class="q-pl-xs">
          <q-item-section avatar>
            <q-checkbox v-model="multi"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ t('drawMulti') }}</q-item-label>
            <q-item-label caption>{{ t('drawMultiCaption') }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>

      <div class='q-mt-md'>
        <div v-for='(layer, key) in sharedLayers' class='measure' :key="'shared-' + key">
          <q-chip
            color="primary"
            text-color="white"
            removable
            @remove="removeFromShared(layer)"
          >
            <span v-html="layerText(layer)"></span><draw-message-input :layer="layer" />
          </q-chip>
        </div>
        <div v-for='(measure, key) in measureControl.measures' class='measure' :key="key">
          <q-chip
            color="primary"
            text-color="white"
            removable
            @remove="removeMeasure(measure)"
          >
            <span v-html="measurementText(measure)"></span><draw-message-input :layer="measureLayer(measure)" />
          </q-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { saveAs } from 'file-saver'
import { ClosePopup, QBtn, QBtnDropdown, QBtnGroup, QCheckbox, QChip, QItem, QItemSection, QItemLabel, QInput, QList, QTooltip } from 'quasar'
import Vue from 'vue'
import { mapState } from 'vuex'
import length from '@turf/length'
import area from '@turf/area'
import L from 'src/lib/leaflet'
import { createLayer } from 'src/lib/geomUtils'
import { convertGeoJsonToDXF, downloadDXF } from 'src/lib/fileutils'

import DrawMessageInput from 'components/DrawMessageInput.vue'
import MeasureResultPopup from 'components/MeasureResultPopup.vue'

export default {
  components: {
    DrawMessageInput,
    QBtn,
    QBtnDropdown,
    QBtnGroup,
    QCheckbox,
    QChip,
    QItem,
    QItemLabel,
    QItemSection,
    QInput,
    QList,
    QTooltip
  },
  directives: {
    ClosePopup
  },
  data () {
    return {
      multi: false,
      measuring: false,
      measureArea: null,
      measureCircle: false,
      radius: null
    }
  },
  computed: {
    ...mapState({
      map: state => state.map.mapObject
    }),
    measureControl () {
      if (this.map && this.map.measureControl) {
        return this.map.measureControl
      } else {
        return {}
      }
    },
    shared () {
      return this.$store.state.map.shared
    },
    sharedLayers () {
      return this.$store.state.map.sharedLayers
    }
  },
  watch: {
    radius: function () {
      this.stopMapMeasuring()
      requestAnimationFrame(() => this.addMeasure('circle'))
    },
    shared: {
      handler: 'updateSharedLayers',
      immediate: true
    }
  },
  destroyed () {
    this.stopMeasuring()
  },
  methods: {
    t (key) {
      return this.$t('tools.draw.' + key)
    },
    updateSharedLayers () {
      this.$nextTick(() => {
        this.$store.dispatch('map/updateSharedLayers')
      })
    },
    layerText (layer) {
      if (layer instanceof L.Marker) {
        const latlng = layer.getLatLng()
        const lat = this.$n(latlng.lat, { maximumFractionDigits: 6, minimumFractionDigits: 6 })
        const lng = this.$n(latlng.lng, { maximumFractionDigits: 6, minimumFractionDigits: 6 })
        return lat + ' ' + lng
      } else if (layer instanceof L.CircleMarker || layer instanceof L.Circle) {
        const latlng = layer.getLatLng()
        const lat = this.$n(latlng.lat, { maximumFractionDigits: 6, minimumFractionDigits: 6 })
        const lng = this.$n(latlng.lng, { maximumFractionDigits: 6, minimumFractionDigits: 6 })
        return lat + ' ' + lng + ' r' + Math.round(layer.getRadius() * 1000) / 1000
      } else if (layer instanceof L.Polygon) {
        const value = this.$n(Math.round(area(layer.toGeoJSON(), { units: 'meters' })))
        return value + ' ' + this.$t('units.meters') + '<sup>2</sup>'
      } else if (layer instanceof L.Polyline) {
        const value = this.$n(Math.round(length(layer.toGeoJSON(), { units: 'meters' })))
        return value + ' ' + this.$t('units.meters')
      } else {
        return '<span style="width: 8ch"></span>'
      }
    },
    measurementText (measure) {
      let result = ''
      result += measure.area || Math.round(measure.length_ori * 100) / 100
      result += ' ' + this.$t('units.' + measure.units_desc)
      if (measure.area) {
        result += '<sup>2</sup>'
      }
      return result
    },
    measureLayer (measure) {
      return measure.layer.getLayers()[0]
    },
    addPopupToLayer (measure) {
      let PopupContent = Vue.extend(MeasureResultPopup)
      let popup = new PopupContent({
        propsData: {
          measure: measure
        }
      })
      for (let layerId in measure.layer._layers) {
        measure.layer._layers[layerId].bindPopup(popup.$mount().$el)
      }
    },
    finishedpath () {
      if (this.multi) {
        requestAnimationFrame(() => this.startMeasuring(this.measureArea))
      } else {
        this.stopMapMeasuring()
      }
    },
    startMeasuring (measureArea) {
      this.measureArea = measureArea
      if (!this.map) {
        this.$except('Measure control is missing the map property')
        return
      }
      if (!this.map.measureControl) {
        this.$except('Measure control is missing the map measureControl')
        return
      }
      this.measuring = true
      this.$store.commit('setCurrentTool', this.map.measureControl)
      this.map.on('measure:measurestop', this.stopMeasuring)
      this.map.on('measure:finishedpath', this.finishedpath)
      this.$nextTick(_ => {
        this.map.measureControl.startMeasuring({ measureArea })
      })
    },
    addMeasure (type) {
      this.measuring = true
      this.$store.commit('setCurrentTool', this.map.measureControl)
      let config
      if (type === 'circle') {
        this.measureCircle = true
        if (this.radius) {
          config = { radius: this.radius }
        }
      }
      createLayer({
        map: this.map,
        type,
        config
      })
        .then(measure => this.finishAddMeasure(measure, type))
        .catch(_ => this.stopMeasuring())
    },
    finishAddMeasure (measure, type) {
      this.$store.dispatch('map/addSharedLayer', measure)
      this.updateSharedLayers()
      if (this.multi) {
        requestAnimationFrame(() => this.addMeasure(type))
      } else {
        this.stopMeasuring()
      }
    },
    stopMapMeasuring () {
      this.$store.dispatch('map/stopDrawing')
      this.$nextTick(_ => {
        // $nextTick needed to prevent infinite event loop
        this.map.measureControl.stopMeasuring()
      })
    },
    stopMeasuring () {
      if (!this.measuring) {
        return
      }
      if (this.measureCircle) {
        this.measureCircle = false
      }
      this.measuring = false
      this.map.off('measure:measurestop', this.stopMeasuring)
      this.map.off('measure:finishedpath', this.finishedpath)
      // FIXME: hardcoded 300ms value from QueryOnClick, get from config
      setTimeout(() => {
        this.$store.commit('setCurrentTool', null)
      }, 300)
    },
    removeMeasure (measure) {
      measure.layer.remove()
    },
    removeFromShared (layer) {
      this.shared.removeLayer(layer)
      this.updateSharedLayers()
    },
    createGeoJSON (layer) {
      let geojson = layer.toGeoJSON()
      geojson.properties['text'] = layer.sharedMessage
      if (layer.getRadius) {
        geojson.properties['radius'] = layer.getRadius().toFixed(3)
      }
      return geojson
    },
    download (fileType) {
      const features = [
        ...this.shared.getLayers().map(layer => this.createGeoJSON(layer)),
        ...this.measureControl.measures.map(measure => {
          let layer = measure.layer.getLayers()[0]
          if (layer instanceof L.LayerGroup) {
            // Area
            layer = layer.getLayers()[0]
          }
          return this.createGeoJSON(layer)
        })
      ]
      if (fileType === 'geojson') {
        const geoJSON = JSON.stringify({ type: 'FeatureCollection', features })
        const blob = new Blob([geoJSON], { type: 'application/geo+json;charset=utf-8' })
        saveAs(blob, 'drawn-in-geoportal.geojson')
      } else if (fileType === 'dxf') {
        const data = { features }
        const dataDXF = convertGeoJsonToDXF(data)
        downloadDXF(dataDXF)
      }
    }
  }
}
</script>
