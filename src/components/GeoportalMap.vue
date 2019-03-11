<template>
  <q-page class="max-height" :style="containerStyle">
    <!-- :options='getMapOptions()' -->
    <v-map ref='map'
           :zoom='$store.config.home.zoom'
           :center="$store.config.home.center"
           @l-ready='onMapReady'>
      <LayersControl ref="layersControl"></LayersControl>
      <query-on-click></query-on-click>
    </v-map>

    <q-resize-observer @resize="onResize" />
  </q-page>
</template>

<script>
import L from 'leaflet'
import Vue2Leaflet from 'vue2-leaflet'

import QueryOnClick from 'components/QueryOnClick.vue'
import LayersControl from 'components/LayersControl.vue'
require('microdisseny-leaflet-measure')
require('microdisseny-leaflet-measure/dist/leaflet-measure.css')

export default {
  components: {
    'v-map': Vue2Leaflet.Map,
    'query-on-click': QueryOnClick,
    LayersControl
  },
  data () {
    return {
      map: null,
      containerStyle: {
        width: null
      }
    }
  },
  computed: {
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
    getMapOptions () {
      return {
        zoomControl: false
      }
    },
    onMapReady () {
      this.map = this.$refs.map.mapObject
      this.addControls()
      this.addBaseMaps()
      this.resultsLayer.addTo(this.map)
      this.$emit('map-ready', this.map)
    },
    onResize (size) {
      this.$store.commit('layout/setMapSize', size)
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
