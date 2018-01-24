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
import axios from 'axios'

import convert from 'xml-js'

import Vue2Leaflet from 'vue2-leaflet'

import LatLngPopup from '@/components/LatLngPopup.vue'
let MyLatLngPopup = Vue.extend(LatLngPopup)
import FeatureInfoPopup from '@/components/FeatureInfoPopup.vue'
let MyFeatureInfoPopup = Vue.extend(FeatureInfoPopup)

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
      let self = this
      var latlng = event.latlng
      console.log('map clicked on ' + new Date() + ' at ' + latlng)

      if (this.marker) {
        this.marker = null
        return
      }

      let marker = new L.Marker(latlng)
      marker.addTo(this.map)
      this.marker = marker

      // check wms services
      var overlays = this._getMapOverlays()
      overlays.forEach(layer => {
        let wmsParams = layer.layer.wmsParams

        var sw = this.map.getBounds().getSouthWest()
        var ne = this.map.getBounds().getNorthEast()
        if (wmsParams.srs === 'EPSG:3857') {
          sw = L.CRS.EPSG3857.project(sw)
          ne = L.CRS.EPSG3857.project(ne)
        }
        let bbox = [sw.x, sw.y, ne.x, ne.y].join(',')

        var params = {
          'request': 'GetFeatureInfo',
          'info_format': 'text/xml',
          'query_layers': wmsParams.layers,
          'bbox': bbox,
          'x': event.containerPoint.x,
          'y': event.containerPoint.y,
          'width': this.map.getSize().x,
          'height': this.map.getSize().y
        }

        let searchUrl = layer.layer._url
        axios.get(searchUrl, {
          params: L.extend({}, wmsParams, params)
        })
        .then(response => {
          let result = convert.xml2js(response.data, {compact: false})
          let results = result.elements[0].elements
          if (results.length > 0 && results[0].elements) {
            marker.bindPopup(this._getFeatureInfoPopup(results).$mount().$el).openPopup()
          } else {
            marker.bindPopup(this._getLatLngPopup(latlng).$mount().$el).openPopup()
          }
        })
        .catch(error => {
          console.log('error', error)
          marker.bindPopup(this._getLatLngPopup(latlng).$mount().$el).openPopup()
        })
      })

      if (overlays.length == 0) {
        marker.bindPopup(this._getLatLngPopup(latlng).$mount().$el).openPopup()
      }

      marker.on('popupclose', function (e) {
        e.sourceTarget.remove()
        // use setTimeout to prevent race condition with next onMapSingleClick
        setTimeout(function () {
          if (self.marker === marker) {
            self.marker = null
          }
        }, 1000)
      })
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
    },
    _getFeatureInfoPopup (info) {
      return new MyFeatureInfoPopup({
        propsData: {
          info: info
        }
      })
    },
    _getLatLngPopup (latlng) {
      return new MyLatLngPopup({
        propsData: {
          latlng: latlng
        }
      })
    },
    _getMapOverlays () {
      return this.map.layerswitcher._layers.filter(layer => {
        // filter layers of type overlay and added to map (visible)
        return layer.overlay && this.map._layers[layer.layer._leaflet_id]
      })
    }
  }
}
</script>

<style lang="scss">
#map { height: 100%; width: 100%; background-color: #ddd; border: 1px dashed #ccc;
  cursor: default;
}
</style>
