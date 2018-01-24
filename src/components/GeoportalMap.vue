<template>
  <div class="center-container">
    <div class="center-row">
      <v-map ref='map' :zoom='2' :center="[0, 0]"
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
      mapClicks: 0,
      mapClickDelay: 500,
      mapClickTimer: null,
      marker: null
    }
  },
  mounted () {
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
    onMapClick: function (event) {
      if (this.marker) {
        this.marker = null
        return
      }

      this.mapClicks += 1
      if (this.mapClicks === 1) {
        let self = this
        this.mapClickTimer = setTimeout(function () {
          self.onMapSingleClick(event)
          self.mapClicks = 0
        }, this.mapClickDelay)
      } else {
        clearTimeout(this.mapClickTimer)
        this.onMapDoubleClick(event.type)
        this.mapClicks = 0
      }
    },
    onMapSingleClick (event) {
      var latlng = event.latlng
      console.log('map clicked on ' + new Date() + ' at ' + latlng)

      this.marker = new L.Marker(latlng)
      this.marker.addTo(this.map)

      let content = new MyLatLngPopup({
        propsData: {
          latlng: latlng
        }
      })

      this.marker.on('popupclose', function (e) {
        e.sourceTarget.remove()
      })
      this.marker.bindPopup(content.$mount().$el).openPopup()
    },
    onMapDoubleClick (event) {
      console.log('Double click')
    },
    onMapReady () {
      this.map = this.$refs.map.mapObject
      this._enableMapClickEvent()
      this.$emit('map-ready', this.map)
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
