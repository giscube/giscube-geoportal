<script>
import { saveAs } from 'file-saver'
import ResultPanelMixin from './ResultPanelMixin'
import FeaturePopup from './FeaturePopup'
import FeaturePopupDialog from './FeaturePopupDialog'
import SearchResultPopupDialog from './SearchResultPopupDialog'
import { createLayerFromConfig } from '../lib/geomUtils'
import { delay, isVoid } from '../lib/utils'
import GiscubeRef from '../lib/refs/giscube'

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
    isDescriptionGeoJSON () {
      const type = this.layerOptions && this.layerOptions.layerDescriptor && this.layerOptions.layerDescriptor.type
      return this.layerOptions ? type && type.toLowerCase() === 'geojson' : false
    },
    address () {
      return this.properties.address
    },
    canAggregate () {
      return this.$config.tools.statistics.enabled && (!!this.table_ || this.isDescriptionGeoJSON)
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
    legend () {
      return this.result && this.result.legend
    },
    metadata () {
      const metadata = []
      let url = this.layerOptions && this.layerOptions.layerDescriptor && this.layerOptions.layerDescriptor.url
      if (url) {
        let text = url
        let type = this.layerOptions.layerDescriptor.type
        if (type && type.toLowerCase() === 'wms') {
          url += '?service=WMS&request=GetCapabilities'
        }
        metadata.push({
          name: 'URL',
          text: text,
          href: url,
          type: type
        })
      }

      return metadata
    },
    layerOptions () {
      if (!this.result) {
        return
      }

      const isGeojson = !!this.result.geojson
      const isAuthenticated = this.result.private || (this.result.origin && this.result.origin.auth)
      const layerDescriptor = this.result && this.result.children && this.result.children.length > 0 && this.result.children[0]
      const options = {
        ...(layerDescriptor && layerDescriptor.giscube && layerDescriptor.giscube.single_image && { singleTile: true }),
        ...(this.result && this.result.options)
      }

      return {
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
        headers: isAuthenticated ? this.$store.getters['auth/headers'] : void 0
      }
    },
    properties () {
      return (this.result && this.result.geojson && this.result.geojson.properties) || {}
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
          this.layer = layer
          this.layerType = type
          this.table_ = table

          this.show()
          if (type === 'GeoJSON') {
            this.layer.openPopup()
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
        this.resultsLayer.addLayer(this.layer)
      }
    },
    pin () {
      if (!this.layer) {
        return
      }

      this.resultsLayer.removeLayer(this.layer)
      this.map.addLayer(this.layer)

      const name = this.layerType === 'WMS' ? this.layerOptions.layerDescriptor.title : this.layerOptions.title
      const getfeatureinfoSupport = this.layerOptions.layerDescriptor && this.layerOptions.layerDescriptor.giscube && this.layerOptions.layerDescriptor.giscube.getfeatureinfo_support
      this.$store.dispatch('map/addOverlay', {
        id: !isVoid(this.result.giscube_id) && new GiscubeRef(this.result.giscube_id),
        layer: this.layer,
        layerType: this.layerType,
        getfeatureinfoSupport,
        name
      })
    },
    async gotoStatistics () {
      if (this.canAggregate) {
        if (this.table_) {
          const { source, layer } = this.table_.remote
          await delay()
          this.$store.dispatch('statistics/setFields', this.table_.info.tableFields)
          this.$store.dispatch('statistics/loadData', { source, layer, title: this.title })
        } else {
          await delay()
          this.$store.dispatch('statistics/setAggregated', { layers: this.layer, title: this.title })
        }
        this.$router.push({ name: 'statistics' })
      }
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
