<template>
  <div class="center-container">
    <div class="center-row">
      <v-map ref='map' :zoom='initialZoom' :center="initialLatLng"
             :options='getMapOptions()' @l-ready='onMapReady'>
      </v-map>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import Vue from 'vue'

import Vue2Leaflet from 'vue2-leaflet'

import LatLngPopup from '@/components/LatLngPopup.vue'
let MyLatLngPopup = Vue.extend(LatLngPopup)

export default {
  components: {
    'v-map': Vue2Leaflet.Map
  },
  data () {
    return {
      map: null,
      initialZoom: 2,
      initialLatLng: [0, 0]
    }
  },
  mounted () {
    this.addControls()
    this.addBaseMaps()
    this.setInitialView()
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
        this.layerswitcher.addBaseLayer(baselayer, basemap.name)
        if (basemap.default) {
          this.map.addLayer(baselayer)
        }
      })
    },
    addControls () {
      this.addScaleControl()
      this.addZoomControl()
      this.addLayersControl()
    },
    addLayersControl () {
      this.layerswitcher = L.control.layers({}, {}, {collapsed: false})
      this.layerswitcher.addTo(this.map)
      this.map.layerswitcher = this.layerswitcher
    },
    addScaleControl () {
      this.scaleControl = L.control.scale({metric: true, imperial: false, 'position': 'bottomright'})
      this.map.addControl(this.scaleControl)
    },
    addZoomControl () {
      this.zoomControl = L.control.zoom({'position': 'bottomright'})
      this.map.addControl(this.zoomControl)
    },
    getMapOptions () {
      return {
        zoomControl: false
      }
    },
    onMapClick (event) {
      var latlng = event.latlng
      console.log('map clicked on ' + new Date() + ' at ' + latlng)

      let content = new MyLatLngPopup({
        propsData: {
          latlng: latlng
        }
      })

      L.popup()
        .setLatLng(latlng)
        .setContent(content.$mount().$el)
        .openOn(this.map)
    },
    onMapReady () {
      this.map = this.$refs.map.mapObject
      this._enableMapClickEvent()
      this.$emit('map-ready', this.map)
    },
    setInitialView () {
      // World
      this.map.setView([0, 0], 2)
    },
    _disableMapClickEvent () {
      this.map.off('click', this.onMapClick, this)
    },
    _enableMapClickEvent () {
      this.map.on('click', this.onMapClick, this)
    }
  }
}
</script>

<style lang="scss">
#map { height: 100%; width: 100%; background-color: #ddd; border: 1px dashed #ccc;
  cursor: default;
}
</style>
