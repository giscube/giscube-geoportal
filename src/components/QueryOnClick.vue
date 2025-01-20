<template>
  <l-marker
    v-if="query"
    :lat-lng="query.latlng"
    :visible="query.visible"
    @add="onAdd"
    @remove="onRemove"
    @popupopen="_setQuery"
    @popupclose="_unsetQuery"
  >
    <l-popup ref="popup">
      <q-spinner v-if="!query.component" />
      <component v-bind:is="query.component" :results='query.results' :latlng='query.latlng' :feature="feature" :render-contents="customPopup" @remove-query="_removeQuery">
      </component>
      <div class="tools" v-if="query.component">
        <q-btn flat dense
          size="sm"
          style="margin-top: 1em"
          icon="delete"
          @click="_removeQuery"
        />
      </div>
    </l-popup>
  </l-marker>
</template>

<script>
import { QBtn, QSpinner } from 'quasar'
import L from '../lib/leaflet'
import axios from 'axios'
import convert from 'xml-js'

import { LMarker, LPopup, findRealParent } from 'vue2-leaflet'
import { makeTemplate } from 'src/lib/makeGeoJsonOptions'
import { higlightWKTGeometry } from 'src/lib/geomUtils'

import LatLngPopup from 'components/LatLngPopup.vue'
import FeatureInfoPopup from 'components/FeatureInfoPopup.vue'
import PopupData from 'components/PopupData.vue'

export default {
  name: 'query-on-click',
  components: {
    LMarker,
    LPopup,
    QBtn,
    QSpinner
  },
  data () {
    return {
      feature: null,
      map: null,
      mapClicks: 0,
      mapClickDelay: 300,
      mapClickTimer: null,
      customPopup: null,
      query: null,
      queryHighlightLayers: []
    }
  },
  computed: {
    currentTool () {
      return this.$store.state.root.currentTool
    },
    currentLayer () {
      return this.$store.state.search.currentLayer
    }
  },
  mounted () {
    this.parentContainer = findRealParent(this.$parent)
    this.map = this.parentContainer.mapObject
    this._enableMapClickEvent()
  },
  methods: {
    onAdd (event) {
      this.$nextTick(() => {
        event.target.openPopup()
      })
    },
    onRemove () {
      this._removeHighlightResultsGeometries()
    },
    onMapDbClick () {
      clearTimeout(this.mapClickTimer)
      this.mapClicks = 0
    },
    onMapClick: function (event) {
      if (this.currentTool) {
        // A tool is active, skip querying map
        return
      }

      if (this.query) {
        this.query.visible = false
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
        this.mapClicks = 0
      }
    },
    async onMapSingleClick (event) {
      if (this.currentTool) {
        // A tool is active, skip querying map
        return
      }

      // remove query and return control to Vue
      this.query = null

      // schedule a new map query after Vue is done removing current query
      const self = this
      this.$nextTick(() => {
        self.onMapSingleClickQuery(event)
      })
    },
    async onMapSingleClickQuery (event) {
      let latlng = event.latlng
      let query = {
        latlng: latlng,
        results: null,
        visible: true
      }
      this.query = query
      this.$store.commit('setQuery', this.query)

      // query before querying Overlays
      await this.queryBeforeOverlays(event, query).then(result => {
        query.results = result
      })

      // query Overlays if there is still no result
      if (!query.results) {
        await this.queryOverlays(event, query).then(result => {
          query.results = result
          if (query.results) {
            if (this.customPopup) {
              query.component = PopupData
              this.feature = { 'properties': {} }
              query.results.forEach(element => {
                let elements = []
                if (element && element.elements) {
                  element.elements.forEach(elem => {
                    let dictAtributes = {}
                    if (elem && elem.elements) {
                      elem.elements.forEach(attribute => {
                        if (attribute.name === 'Attribute' && attribute.attributes.name !== 'geometry') {
                          dictAtributes[this.toSnakeCase(attribute.attributes.name)] = attribute.attributes.value
                        }
                      })
                    }
                    elements.push(dictAtributes)
                  })
                }
                this.feature.properties[this.toSnakeCase(element.attributes.name)] = elements
              })
            } else {
              query.component = FeatureInfoPopup
            }
            this._highlightResultsGeomtries()
          }
        })
      }

      // query after querying Overlays if there is still no result
      if (!query.results) {
        await this.queryAfterOverlays(event, query).then(result => {
          query.results = result
        })
      }

      if (!query.results) {
        query.component = LatLngPopup
        // Hack around popup not updating content
        this.query = null
        this.$nextTick(() => {
          this.query = query
        })
      }
      if (this.$refs.popup) {
        // force the popup to be created again with proper dimensions
        this.$refs.popup.mapObject.update()
        this.$nextTick(() => {
          if (this.$refs.popup) {
            // Proper size in Firefox
            this.$refs.popup.mapObject.update()
          }
        })
      }
    },
    async queryAfterOverlays (event, marker) {
      // override this function to query for results after querying overlays
      // return null for no results
      return null
    },
    async queryBeforeOverlays (event, marker) {
      // override this function to query for results before query overlays
      // return null for no results
      return null
    },
    async queryOverlays (event, marker) {
      // check wms services
      // let latlng = event.latlng
      var queryResults = null
      var overlays = this._getMapOverlays()

      if (this.currentLayer) {
        queryResults = await this.getInfoFromWMS(this.currentLayer, event)
      }

      while (!queryResults && overlays.length > 0) {
        let layer = overlays.shift()
        let info = await this.getInfoFromWMS(layer, event)
        if (info) {
          queryResults = info
        }
      }

      // return null for no results
      return queryResults
    },
    async getInfoFromWMS (layer, event) {
      if (layer.layerType.toLowerCase() !== 'wms') {
        return null
      }

      if (layer.getfeatureinfoSupport !== void 0 && !layer.getfeatureinfoSupport) {
        return null
      }

      let wmsParams = layer.layer.wmsParams
      if (layer.popup) {
        this.customPopup = makeTemplate(layer.popup)
      }

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
        'x': Math.floor(event.containerPoint.x),
        'y': Math.floor(event.containerPoint.y),
        'width': this.map.getSize().x,
        'height': this.map.getSize().y,
        'feature_count': 100,
        'with_geometry': true
      }

      let searchUrl = layer.layer._url

      let queryResults = null
      await axios.get(searchUrl, {
        params: L.extend({}, wmsParams, params)
      })
        .then(response => {
          let result = convert.xml2js(response.data, { compact: false })
          let results = result.elements[0].elements
          if (results.length > 0 && results.some(layer => layer.elements)) {
            queryResults = results
          }
        })
        .catch(this.$except)

      return queryResults
    },
    _highlightResultsGeomtries () {
      this.query.results.forEach(element => {
        if (element && element.elements) {
          element.elements.forEach(elem => {
            elem.elements.forEach(attribute => {
              if (attribute.name === 'Attribute' && attribute.attributes.name === 'geometry') {
                let layers = higlightWKTGeometry(attribute.attributes.value)
                if (layers.length > 0) {
                  this.queryHighlightLayers.push(...layers)
                }
              }
            })
          })
          this.queryHighlightLayers.forEach(layer => this.map.addLayer(layer))
        }
      })
    },
    _removeHighlightResultsGeometries () {
      if (this.queryHighlightLayers.length > 0) {
        this.queryHighlightLayers.forEach(layer => this.map.removeLayer(layer))
        this.queryHighlightLayers = []
      }
    },
    _setQuery () {
      this.$store.commit('setQuery', this.query)
    },
    _unsetQuery () {
      this.$store.dispatch('removeQuery', this.query)
    },
    _removeQuery () {
      this._unsetQuery()
      this.query = null
    },
    _disableMapClickEvent () {
      this.map.off('dblclick', this.onMapDbClick, this)
      this.map.off('click', this.onMapClick, this)
    },
    _enableMapClickEvent () {
      this.map.on('click', this.onMapClick, this)
      this.map.on('dblclick', this.onMapDbClick, this)
    },
    _getMapOverlays () {
      return this.$store.state.map.layers.overlays.filter(overlay => overlay.visible)
    },
    toSnakeCase (str) {
      if (str !== 'undefined') {
        const strArr = str.split(' ')
        const snakeArr = strArr.reduce((acc, val) => {
          return acc.concat(val.toLowerCase())
        }, [])
        return snakeArr.join('_')
      } return str
    }
  }
}
</script>

<style scoped>
.tools {
  border-top: 1px dashed #ddd;
  margin-top: 10px;
  padding: 8px 0px 0px 0px;
}
.tool-remove-query {
  font-size: 0.8em;
  text-align: center;
  display: inline-block;
  background-color: #eee;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
