<template>
  <q-page class="max-height" :style="containerStyle">
    <!-- :options='getMapOptions()' -->
    <l-map ref='map'
      :zoom='$store.config.home.zoom'
      :center="$store.config.home.center"
      :options="mapOptions"
      @leaflet:load='onMapReady'
    >
      <layers-control ref="layersControl"></layers-control>
      <!-- Query On Click -->
      <component :is="$config.geoportalMap.queryOnClick" />
      <l-geo-json ref='editGeoJsonLayer' v-if="currentTool === 'data' && editLayerGeojson && editLayerOptions" :geojson="editLayerGeojson" :options="editLayerOptions"></l-geo-json>
    </l-map>

    <icons-generator />

  </q-page>
</template>

<script>
import { QPage } from 'quasar'
import L from '../lib/leaflet'
import { LMap, LGeoJson } from 'vue2-leaflet'

import LayersControl from 'components/LayersControl.vue'
require('microdisseny-leaflet-measure')
require('microdisseny-leaflet-measure/dist/leaflet-measure.css')

import IconsGenerator from './icons/IconsGenerator'

export default {
  components: {
    IconsGenerator,
    LayersControl,
    LGeoJson,
    LMap,
    QPage
  },
  data () {
    return {
      map: null,
      containerStyle: {
        width: null
      },
      mapOptions: {
        editable: true
      }
    }
  },
  computed: {
    currentTool () {
      return this.$store.state.currentTool
    },
    editLayerGeojson () {
      return this.$store.state.dataLayer.geojson
    },
    editLayerOptions () {
      return this.$store.state.dataLayer.layerConfig.options
    },
    editing () {
      return this.$store.state.dataLayer.editStatus.editing
    },
    resultsLayer () {
      return this.$store.state.resultsLayer
    }
  },
  created () {
    if (!this.resultsLayer) {
      let layerGeoJson = L.geoJson('', {
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.title)
        }
      })
      this.$store.commit('createResultsLayer', layerGeoJson)
    }
  },
  mounted () {
    if (this.map) {
      this.map.invalidateSize()
    }
  },
  methods: {
    addBaseMaps () {
      this.$store.config.basemaps.forEach(basemap => {
        var baselayer
        if (basemap.type === 'tilelayer') {
          baselayer = L.tileLayer(basemap.url, basemap)
        } else if (basemap.type === 'wms') {
          baselayer = L.tileLayer.wms(basemap.url, basemap)
        }
        this.layerswitcher.addBaseLayer(baselayer, basemap.name, {
          default: basemap.default
        })
        if (basemap.default) {
          this.map.addLayer(baselayer)
        }
      })
    },
    addControls () {
      this.addScaleControl()
      this.addZoomControl()
      this.addGeolocationControl()
      this.addLayersControl()
      this.addMeasureControl()
    },
    addLayersControl () {
      // leaflet's Layers Control
      // this.layerswitcher = L.control.layers({}, {}, {collapsed: false})
      // this.layerswitcher.addTo(this.map)
      this.layerswitcher = this.$refs.layersControl
      this.map.layerswitcher = this.layerswitcher
    },
    addMeasureControl () {
      this.measureControl = new L.Control.Measure({
        measureUnit: 'meters',
        createButton: false
      })
      this.map.measureControl = this.measureControl
      this.map.addControl(this.measureControl)
    },
    addScaleControl () {
      this.scaleControl = L.control.scale({ metric: true, imperial: false, 'position': 'bottomright' })
      this.map.addControl(this.scaleControl)
    },
    addZoomControl () {
      if (this.map.zoomControl) {
        this.map.zoomControl.remove()
      }
      this.zoomControl = L.control.zoom({ 'position': 'bottomright' })
      this.map.addControl(this.zoomControl)
    },
    addGeolocationControl () {
      L.control.locate({ 'position': 'bottomright' }).addTo(this.map)
    },
    getMapOptions () {
      return {
        zoomControl: false
      }
    },
    onMapReady () {
      this.$nextTick(() => {
        this.map = this.$refs.map.mapObject
        this.addControls()
        this.addBaseMaps()
        this.resultsLayer.addTo(this.map)
        this.$store.commit('map/mapObject', this.map)
        this.$emit('map-ready', this.map)
      })
    },
    setMapWidth (width) {
      this.containerStyle.width = width
      this.$nextTick(() => {
        this.map.invalidateSize(false)
      })
    }
  }
}
</script>

<style lang="scss">
.center-row {
  height: 100%;
}

#map { height: 100%; width: 100%; background-color: #ddd; border: 1px dashed #ccc;
  cursor: default;
}
</style>
