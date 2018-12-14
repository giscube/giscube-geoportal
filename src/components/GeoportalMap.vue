<template>
    <div class="center-row">
      <!-- :options='getMapOptions()' -->
      <l-map ref='map'
             :zoom='$store.config.home.zoom'
             :center="$store.config.home.center"
             @l-ready='onMapReady'>
        <LayersControl ref="layersControl"></LayersControl>
        <query-on-click></query-on-click>
      </l-map>
    </div>
</template>

<script>
import L from 'leaflet'
import Vue2Leaflet from 'vue2-leaflet'

import QueryOnClick from '@/components/QueryOnClick.vue'
import LayersControl from '@/components/LayersControl.vue'
require('microdisseny-leaflet-measure')
require('microdisseny-leaflet-measure/dist/leaflet-measure.css')

export default {
  components: {
    'l-map': Vue2Leaflet.Map,
    'query-on-click': QueryOnClick,
    LayersControl
  },
  data () {
    return {
      map: null
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
    this.map = this.$refs.map.mapObject
    this.addControls()
    this.addBaseMaps()
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
      this.scaleControl = L.control.scale({metric: true, imperial: false, 'position': 'bottomright'})
      this.map.addControl(this.scaleControl)
    },
    addZoomControl () {
      if (this.map.zoomControl) {
        this.map.zoomControl.remove()
      }
      this.zoomControl = L.control.zoom({'position': 'bottomright'})
      this.map.addControl(this.zoomControl)
    },
    getMapOptions () {
      return {
        zoomControl: false
      }
    },
    onMapReady () {
      this.map = this.$refs.map.mapObject
      this.resultsLayer.addTo(this.map)
      this.$emit('map-ready', this.map)
    }
  }
}
</script>

<style lang="scss">
#map { height: 100%; width: 100%; background-color: #ddd; border: 1px dashed #ccc;
  cursor: default;
}
</style>
