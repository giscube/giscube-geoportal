<template>
  <l-marker v-if="query" :visible="query.visible" :lat-lng="query.latlng"
            @add="onAdd">
    <l-popup ref="popup">
      <q-spinner v-if="!query.component" />
      <component v-bind:is="query.component" :results='query.results' :latlng='query.latlng'>
        test
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

import LatLngPopup from 'components/LatLngPopup.vue'
import FeatureInfoPopup from 'components/FeatureInfoPopup.vue'

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
      map: null,
      mapClicks: 0,
      mapClickDelay: 300,
      mapClickTimer: null,
      query: null
    }
  },
  computed: {
    currentTool () {
      return this.$store.state.currentTool
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
    onMapClick: function (event) {
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
          query.component = FeatureInfoPopup
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
      while (!queryResults && overlays.length > 0) {
        let layer = overlays.shift()

        if (layer.layerType !== 'WMS') {
          continue
        }

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
          'x': Math.floor(event.containerPoint.x),
          'y': Math.floor(event.containerPoint.y),
          'width': this.map.getSize().x,
          'height': this.map.getSize().y,
          'feature_count': 100
        }

        let searchUrl = layer.layer._url

        await axios.get(searchUrl, {
          params: L.extend({}, wmsParams, params)
        })
          .then(response => {
            let result = convert.xml2js(response.data, { compact: false })
            let results = result.elements[0].elements
            if (results.length > 0 && results[0].elements) {
              queryResults = results
            }
          })
          .catch(this.$except.http)
      }

      // return null for no results
      return queryResults
    },
    _removeQuery () {
      if (this.query) {
        this.query = null
        this.$store.commit('setQuery', this.query)
      }
    },
    _disableMapClickEvent () {
      this.map.off('click', this.onMapClick, this)
    },
    _enableMapClickEvent () {
      this.map.on('click', this.onMapClick, this)
    },
    _getMapOverlays () {
      var layers = this.map.layerswitcher._layers
      if (!layers) {
        layers = this.map.layerswitcher.layers
      }
      return layers.filter(layer => {
        // filter layers of type overlay and added to map (visible)
        return layer.overlay && this.map._layers[layer.layer._leaflet_id]
      })
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
