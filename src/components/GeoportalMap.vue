<template>
  <q-page class="max-height" :style="containerStyle">
    <l-map ref='map'
      :zoom='$config.home.zoom'
      :center="$config.home.center"
      :options="mapOptions"
      @leaflet:load='onMapReady'
      @move="onMapMove"
    >
      <layers-control ref="layersControl"></layers-control>
      <!-- Query On Click -->
      <component :is="$config.geoportalMap.queryOnClick" />
    </l-map>

  </q-page>
</template>

<script>
import { QPage } from 'quasar'
import { debounce } from 'lodash'
import L from '../lib/leaflet'
import { LMap, LGeoJson } from 'vue2-leaflet'

import LayersControl from 'components/LayersControl.vue'
require('microdisseny-leaflet-measure')
require('microdisseny-leaflet-measure/dist/leaflet-measure.css')

export default {
  components: {
    LayersControl,
    LGeoJson,
    LMap,
    QPage
  },
  data () {
    return {
      containerStyle: {
        width: null
      },
      mapOptions: {
        attributionControl: false,
        zoomControl: false,
        editable: true
      }
    }
  },
  computed: {
    map: {
      get () {
        return this.$store.state.map.mapObject
      },
      set (value) {
        return this.$store.dispatch('map/setMap', value)
      }
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
    mainTable () {
      return this.$store.state.dataLayer.table
    }
  },
  watch: {
    mainTable: {
      handler (newValue, oldValue) {
        if (oldValue) {
          oldValue.removeLayers()
        }
        if (newValue) {
          newValue.addTo(this.map)
        }
      }
    }
  },
  created () {
    this.onMapMove = debounce(this.updateMapPosition, 100)
    this.updateTable = this._updateTable.bind(this)
    this.startDrawing = this._setDrawing.bind(this, true)
    this.endDrawing = this._setDrawing.bind(this, false)
  },
  mounted () {
    if (this.map) {
      this.map.invalidateSize()
    }
  },
  methods: {
    addControls () {
      this.addAttribution()
      this.addScaleControl()
      this.addZoomControl()
      this.addGeolocationControl()
      this.addMeasureControl()
    },
    addAttribution () {
      L.control.attribution({
        prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps" target="_blank">Leaflet</a> | <a href="http://www.giscube.com/" target="_blank">Giscube</a>',
        position: 'bottomright'
      })
        .addTo(this.map)
    },
    addMeasureControl () {
      this.map.measureControl = L.control.measure({
        measureUnit: 'meters',
        createButton: false
      })
        .addTo(this.map)
    },
    addScaleControl () {
      L.control.scale({ metric: true, imperial: false, 'position': 'bottomright' })
        .addTo(this.map)
    },
    addZoomControl () {
      L.control.zoom({ 'position': 'bottomright' })
        .addTo(this.map)
    },
    addGeolocationControl () {
      L.control.locate({ 'position': 'bottomright' })
        .addTo(this.map)
    },
    onMapReady () {
      if (this.map) {
        this.map.off('move zoom', this.updateTable)
        this.map.off('editable:drawing:start', this.startDrawing)
        this.map.off('editable:drawing:end', this.endDrawing)
      }

      this.map = this.$refs.map.mapObject

      this.addControls()
      this.$store.dispatch('map/setDefaultBaseLayer')
      if (this.mainTable) {
        this.mainTable.addTo(this.map)
      }
      this.updateMapPosition()
      this.map.on('editable:drawing:start', this.startDrawing)
      this.map.on('editable:drawing:end', this.endDrawing)
      this.map.on('move zoom', this.updateTable)
    },
    updateMapPosition () {
      this.$store.commit('map/center', this.map.getVisibleCenter())
      this.$store.commit('map/zoom', this.map.getZoom())
    },
    setMapWidth (width) {
      this.containerStyle.width = width
      this.$nextTick(() => {
        this.map.invalidateSize(false)
      })
    },
    _updateTable () {
      if (this.mainTable && !this.mainTable.editing) {
        this.mainTable.updateByMap()
      }
    },
    _setDrawing (value) {
      this.$store.commit('map/drawing', value)
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
