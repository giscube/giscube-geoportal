<script>
import { saveAs } from 'file-saver'
import ResultPanelMixin from './ResultPanelMixin'
import FeaturePopup from './FeaturePopup'
import FeaturePopupDialog from './FeaturePopupDialog'
import PolygonTooltip from './statistics/PolygonTooltip'
import SearchResultPopupDialog from './SearchResultPopupDialog'
import { createLayerFromConfig } from '../lib/geomUtils'
import { delay, isVoid } from '../lib/utils'
import GiscubeRef from '../lib/refs/giscube'
import { mapState } from 'vuex'

export default {
  mixins: [ResultPanelMixin],
  data () {
    return {
      layer: null,
      layerType: null,
      table_: null
    }
  },
  computed: {
    ...mapState({
      overlays: state => state.map.layers.overlays
    }),

    isDescriptionGeoJSON () {
      const type = this.layerOptions && this.layerOptions.layerDescriptor && this.layerOptions.layerDescriptor.type
      return this.layerOptions ? type && type.toLowerCase() === 'geojson' : false
    },
    address () {
      return this.properties.address
    },
    canAggregate () {
      return (!!this.table_ || this.isDescriptionGeoJSON)
    },
    canDownload () {
      return this.isDescriptionGeoJSON
    },
    canPin () {
      return !!this.layer
    },
    coordinates () {
      if (this.result && this.result.latlng) {
        return this.result.latlng.coordinates[0].toFixed(6) + ', ' + this.result.latlng.coordinates[1].toFixed(6)
      } else {
        return null
      }
    },
    description () {
      return this.result && this.result.description
    },
    geom () {
      return this.layer
    },
    keywords () {
      return this.result && this.result.keywords && this.result.keywords.split(',').map(item => item.trim())
    },
    layerDescriptor () {
      const layerDescriptor = []
      let url = this.layerOptions && this.layerOptions.layerDescriptor && this.layerOptions.layerDescriptor.url
      if (url) {
        let text = url
        const type = this.layerOptions.layerDescriptor.type
        if (type && type.toLowerCase() === 'wms') {
          url += '?service=WMS&request=GetCapabilities'
        }
        layerDescriptor.push({
          name: 'URL',
          text: text,
          href: url,
          type: type
        })
      }

      return layerDescriptor
    },
    layerOptions () {
      if (!this.result) {
        return
      }

      const isGeojson = !!this.result.geojson
      const isAuthenticated = this.result.private || (this.result.origin && this.result.origin.auth)
      const layerDescriptor = this.result && this.result.children && this.result.children.length > 0 && this.result.children[0]
      const downloads = layerDescriptor && this.result.children.filter(child => child.giscube && child.giscube.downloadable)
      const options = {
        ...(layerDescriptor && layerDescriptor.giscube && layerDescriptor.giscube.single_image && { singleTile: true }),
        ...(this.result && this.result.options)
      }

      return {
        accessToken: this.$store.state.auth.accessToken,
        isAuthenticated,
        result: this.result,
        layerDescriptor,
        title: this.result && this.result.title,
        options,
        map: this.map,
        popupComponent: isGeojson ? this.$config.tools.search.searchResultPopup : FeaturePopup,
        dialogComponent: isGeojson ? SearchResultPopupDialog : FeaturePopupDialog,
        metaOptions: {
          root: this.$root
        },
        headers: isAuthenticated ? this.$store.getters['auth/headers'] : void 0,
        downloads
      }
    },
    legend () {
      return this.result && this.result.legend
    },
    metadata () {
      if (this.result && this.result.metadata) {
        for (let prop in this.result.metadata) {
          if (this.result.metadata[prop]) {
            return this.result.metadata
          }
        }
      }
      return null
    },
    overlay () {
      const overlay = this.overlays.filter(overlay => { return this.result && this.result.giscube_id === overlay.id.plainRef })
      return overlay && overlay.length > 0 && overlay[0]
    },
    properties () {
      return (this.result && this.result.geojson && this.result.geojson.properties) || {}
    },
    downloads () {
      return this.layerOptions && this.layerOptions.downloads
    },
    table () {
      return this.table_
    },
    title () {
      return this.result && this.result.title
    }
  },
  mounted () {
    this.applyParameters(this.$route.params)
    this.isInfo ? this.tab = 'info' : this.isData ? this.tab = 'data' : this.isExternalSearchResult ? this.tab = 'search-result' : this.tab = 'metadata'
  },
  methods: {
    applyParameters (params) {
      if (this.result && params.q === this.title) {
        this.applyResult()
      } else {
        // redirect
        this.$router.replace({ name: 'search', params: this.$route.params })
      }
    },
    applyResult () {
      createLayerFromConfig(this.layerOptions)
        .then(({ type, layer, table }) => {
          this.layerType = type
          this.table_ = table
          if (this.overlay) {
            this.layer = this.overlay.layer
            if (this.overlay.statsOption) {
              this.setBy(this.overlay.statsOption)
            }
          } else {
            this.layer = layer
            this.show()
          }

          if (type === 'GeoJSON') {
            this.layer.openPopup()
            this.zoom()
          }
        })
        .catch(e => {
          if (e) {
            this.$except(e)
          }
        })
    },
    show () {
      if (this.layer) {
        this.resultsLayer.addLayer(this.layer).bringToFront()
      }
    },
    idFromString (word) {
      let number = 0
      for (let i = 0; i < word.length; i++) {
        number += word.charCodeAt(i)
      }
      return number
    },
    pin () {
      if (!this.layer) {
        return
      }

      this.resultsLayer.removeLayer(this.layer)
      this.map.addLayer(this.layer)

      const name = this.layerType === 'WMS' ? this.layerOptions.layerDescriptor.title : this.layerOptions.title
      const getfeatureinfoSupport = this.layerOptions.layerDescriptor && this.layerOptions.layerDescriptor.giscube && this.layerOptions.layerDescriptor.giscube.getfeatureinfo_support
      const id = !isVoid(this.result.giscube_id) ? new GiscubeRef(this.result.giscube_id) : new GiscubeRef(this.idFromString(`${this.result.title}-${this.result.subtitle}`))
      this.$store.dispatch('map/addOverlay', {
        id,
        layer: this.layer,
        layerType: this.layerType,
        options: this.layerOptions.options,
        getfeatureinfoSupport,
        name
      })
    },
    async setBy (option) {
      const tooltip = { parent: this, Component: PolygonTooltip }
      this.$store.dispatch('statistics/selectBy', { option, tooltip })
      await delay()
      this.$store.dispatch('statistics/aggregate')
    },
    download () {
      if (this.canDownload) {
        this.$axios.get(this.layerOptions.layerDescriptor.url, {
          headers: this.layerOptions.headers,
          responseType: 'blob'
        })
          .then(result => {
            saveAs(result.data, 'result.geojson')
          })
      }
    }
  }
}
</script>
