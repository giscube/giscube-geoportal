<template>
  <v-marker v-if="query" :visible="query.visible" :lat-lng="query.latlng"
            @l-add="$event.target.openPopup()">
    <v-popup ref="popup">
      <div v-if="!query.component" style="text-align: center;">
        <icon name="spinner" pulse label="Searching"></icon>
      </div>
      <component v-bind:is="query.component" :results='query.results' :latlng='query.latlng'>
        test
      </component>
    </v-popup>
  </v-marker>
</template>

<script>
import L from 'leaflet'
import axios from 'axios'
import convert from 'xml-js'

import Vue2Leaflet from 'vue2-leaflet'

import LatLngPopup from '@/components/LatLngPopup.vue'
import FeatureInfoPopup from '@/components/FeatureInfoPopup.vue'

import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'query-on-click',
  components: {
    'v-marker': Vue2Leaflet.Marker,
    'v-popup': Vue2Leaflet.Popup,
    Icon
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
  mounted () {
    if (this.$parent._isMounted) {
      this.deferredMountedTo(this.$parent.mapObject)
    }
  },
  methods: {
    deferredMountedTo (parent) {
      this.parent = parent
      this.map = parent
      this.mapObject = parent
      this._enableMapClickEvent()
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
        this.onMapDoubleClick(event.type)
        this.mapClicks = 0
      }
    },
    async onMapSingleClick (event) {
      let latlng = event.latlng
      console.log('map clicked on ' + new Date() + ' at ' + latlng)

      if (this.query) {
        this.query = null
        console.log('query deleted')
        return
      }

      let query = {
        latlng: latlng,
        results: null,
        visible: true
      }
      this.query = query

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
      }
    },
    onMapDoubleClick (event) {
      console.log('Double click')
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

        await axios.get(searchUrl, {
          params: L.extend({}, wmsParams, params)
        })
        .then(response => {
          let result = convert.xml2js(response.data, {compact: false})
          let results = result.elements[0].elements
          if (results.length > 0 && results[0].elements) {
            queryResults = results
          }
        })
        .catch(error => {
          console.log('error', error)
        })
      }

      // return null for no results
      return queryResults
    },
    _disableMapClickEvent () {
      this.map.off('click', this.onMapClick, this)
    },
    _enableMapClickEvent () {
      this.map.on('click', this.onMapClick, this)
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

<style>
</style>
