<template>
  <q-page class="max-height" :style="containerStyle">
    <l-map ref='map'
      :zoom='$config.home.zoom'
      :center="$config.home.center"
      :options="mapOptions"
      @leaflet:load='onMapReady'
      @move="onMapMove"
    >
      <layers-control ref="layersControl" v-show="!hideLayersControl"></layers-control>
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
import { mapState } from 'vuex'
import MiniMap from 'leaflet-minimap'

import { makeBaseLayer } from '../lib/geomUtils'
import { onToolClick } from '../lib/toolUtils'
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
      },
      ctrlPressed: false,
      cmdPressed: false
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
    ...mapState('map', ['mapGroup', 'hideLayersControl']),
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
    },
    toolsControlVisible () {
      return this.$store.state.layout.toolsControlVisible
    },
    mapControlled () {
      return this.$store.state.layout.mapControlled
    },
    isModifierPressed () {
      return this.ctrlPressed || this.cmdPressed
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
    },
    toolsControlVisible: {
      handler (isVisible) {
        const toolsBar = document.getElementsByClassName('easy-button-container')
        Array.from(toolsBar).forEach(element => { element.style.display = isVisible ? 'block' : 'none' })
        document.getElementById('share-control').style.display = isVisible ? 'block' : 'none'
      }
    },
    mapControlled: {
      handler (value) {
        if (value) {
          this.disabledZoom()
        }
      }
    }
  },
  created () {
    this.onMapMove = debounce(this.updateMapPosition, 100)
    this.updateTable = debounce(this._updateTable.bind(this), 100)
    this.startDrawing = this._setDrawing.bind(this, true)
    this.endDrawing = this._setDrawing.bind(this, false)
  },
  mounted () {
    if (this.map) {
      this.map.invalidateSize()
    }
    this.setupKeyboardListeners()
  },
  beforeDestroy () {
    this.removeKeyboardListeners()
  },
  methods: {
    setupKeyboardListeners () {
      document.addEventListener('keydown', this.onKeyDown)
      document.addEventListener('keyup', this.onKeyUp)
    },
    removeKeyboardListeners () {
      document.removeEventListener('keydown', this.onKeyDown)
      document.removeEventListener('keyup', this.onKeyUp)
    },
    onKeyDown (event) {
      if (event.ctrlKey || event.metaKey) {
        this.ctrlPressed = event.ctrlKey
        this.cmdPressed = event.metaKey
        this.updateZoomBehavior()
      }
    },
    onKeyUp (event) {
      if (!event.ctrlKey && !event.metaKey) {
        this.ctrlPressed = false
        this.cmdPressed = false
        this.updateZoomBehavior()
      }
    },
    disabledZoom () {
      this.map.scrollWheelZoom.disable()
      this.map.doubleClickZoom.disable()
      this.map.touchZoom.disable()
      this.map.boxZoom.disable()
      this.map.keyboard.disable()
    },
    updateZoomBehavior () {
      if (!this.map || !this.mapControlled) return

      if (this.isModifierPressed) {
        this.map.scrollWheelZoom.enable()
        this.map.doubleClickZoom.enable()
        this.map.touchZoom.enable()
        this.map.boxZoom.enable()
        this.map.keyboard.enable()
      } else {
        this.disabledZoom()
      }
    },
    setupZoomControl () {
      if (!this.mapControlled) return

      this.disabledZoom()

      this.map.on('wheel', (e) => {
        if (this.mapControlled && !this.isModifierPressed) {
          e.originalEvent.preventDefault()
          e.originalEvent.stopPropagation()
          return false
        }
      })

      this.map.on('dblclick', (e) => {
        if (this.mapControlled && !this.isModifierPressed) {
          e.originalEvent.preventDefault()
          e.originalEvent.stopPropagation()
          return false
        }
      })

      this.map.on('touchstart', (e) => {
        if (this.mapControlled && !this.isModifierPressed && e.originalEvent.touches.length > 1) {
          e.originalEvent.preventDefault()
          e.originalEvent.stopPropagation()
          return false
        }
      })
    },
    addControls () {
      this.addAttribution()
      this.addScaleControl()
      this.addToolsBar()
      this.addMiniMap()
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
    addToolsBar () {
      const tools = this.$config.tools
      const self = this
      L.easyButton({
        position: 'bottomright',
        id: 'street-view-control',
        states: [{
          icon: '<span class="las la-street-view" style="font-size: 18px; margin-top: 5px"></span>',
          title: this.$t('tools.streetview.headerName'),
          onClick: function (btn, map) {
            onToolClick('streetview', self)
          }
        }]
      }).addTo(this.map)
      L.easyButton({
        position: 'bottomright',
        id: 'clean-map',
        states: [{
          icon: `<span class="material-icons" style="font-size: 16px; margin-top: -1px">${tools.cleanMap.icon}</span>`,
          title: this.$t('tools.cleanMap.headerName'),
          onClick: function (btn, map) {
            onToolClick('cleanMap', self)
          }
        }]
      }).addTo(this.map)
      L.easyButton({
        position: 'bottomright',
        id: 'draw-control',
        states: [{
          icon: `<span class="${tools.draw.icon}" style="font-size: 18px; margin-top: 6px"></span>`,
          title: this.$t('tools.draw.title'),
          onClick: function (btn, map) {
            onToolClick('draw', self)
          }
        }]
      }).addTo(this.map)
      L.easyButton({
        position: 'bottomright',
        id: 'print-control',
        states: [{
          icon: `<span class="${tools.print.icon}" style="font-size: 18px; margin-top: 6px"></span>`,
          title: this.$t('tools.print.headerName'),
          onClick: function (btn, map) {
            onToolClick('print', self)
          }
        }]
      }).addTo(this.map)
      L.easyButton({
        position: 'bottomright',
        id: 'share-control',
        leafletClasses: false,
        states: [{
          icon: `<span class="material-icons" style="font-size: 16px; margin-top: -1px">${tools.share.icon}</span>`,
          title: this.$t('tools.share.headerName'),
          onClick: function (btn, map) {
            onToolClick('share', self)
          }
        }]
      }).addTo(this.map)
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
    addMiniMap () {
      const basemap = this.$config.minimap && this.$config.minimap.basemap
      if (basemap) {
        const layer = makeBaseLayer(basemap)
        let options = this.$config.minimap.options || {}
        options.minimized = options.minimized || true
        options.toggleDisplay = options.toggleDisplay || true
        options.collapsedHeight = 25
        options.collapsedWidth = 25
        new MiniMap(layer, options).addTo(this.map)
      }
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
      this.map.addLayer(this.mapGroup)
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
      if (this.mainTable) {
        if (!this.mainTable.editing) {
          this.mainTable.updateByMap()
        } else {
          this.mainTable.deferUpdate()
        }
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
.leaflet-control-minimap-toggle-display.leaflet-control-minimap-toggle-display-bottomright {
  background-image: url('../assets/globe-icon.png');
  height: 19px!important;
  width: 19px!important;
}
#map { height: 100%; width: 100%; background-color: #ddd; border: 1px dashed #ccc;
  cursor: default;
}
.leaflet-bar.leaflet-control {
  border: 0px;
}
.leaflet-bottom.leaflet-right {
  margin-right: 5px;
  margin-bottom: -5px;
}
.leaflet-bottom.leaflet-right .leaflet-control {
  margin-right: 5px;
}
.leaflet-bottom .leaflet-control {
  margin-bottom: 5px;
}
.leaflet-control.easy-button-container {
  clear: none;
}
#share-control {
  width: 30px;
  height: 30px;
  border: none;
  background: #fff;
  border-radius: 4px;
}
#share-control:hover {
  background-color: #f4f4f4;
  cursor: pointer;
}
.leaflet-control-scale.leaflet-control {
  padding-top: 12px;
  clear: none;
}
</style>
