<template>
  <div class="center-container">
    <div class="center-row">
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'

export default {
  data () {
    return {
      map: null
    }
  },
  mounted () {
    let options = this.getMapOptions()
    this.map = L.map('map', options)
    this.map.whenReady(this.onMapReady, this)
    window.map = this.map
    // this.$store.commit('setMap', map)

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
    },
    onMapReady () {
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
