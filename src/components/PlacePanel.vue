<script>
import ResultPanelMixin from './ResultPanelMixin'
import FeaturePopup from './FeaturePopup'
import SearchResultPopup from './SearchResultPopup'
import { createLayerFromConfig } from '../lib/geomUtils'

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
    address () {
      return this.properties.address
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
    metadata () {
      const metadata = []
      let url = this.layerOptions.layerDescriptor && this.layerOptions.layerDescriptor.url
      if (url) {
        let text = url
        if (this.layerOptions.layerDescriptor.type && this.layerOptions.layerDescriptor.type.toLowerCase() === 'wms') {
          url += '?service=WMS&request=GetCapabilities'
        }
        metadata.push({
          name: 'URL',
          text: text,
          href: url
        })
      }

      return metadata
    },
    layerOptions () {
      const isGeojson = !!this.result.geojson

      return {
        result: this.result,
        layerDescriptor: this.result && this.result.children && this.result.children.length > 0 && this.result.children[0],
        title: this.result && this.result.title,
        options: (this.result && this.result.options) || {},
        map: this.map,
        popupComponent: isGeojson ? SearchResultPopup : FeaturePopup,
        metaOptions: {
          root: this.$root
        }
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
  methods: {
    applyParameters (params) {
      if (this.result && params.q === this.title) {
        this.applyResult()
      } else {
        // redirect
        return true
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
            const visibleBBox = this.$store.getters['map/bbox']() // => map/bounds
            const paddedVisibleBBox = visibleBBox.pad(-this.$config.layout.mapZoomPadding)
            const pos = layer.getBounds ? layer.getBounds() : layer.getLatLng()
            const visible = paddedVisibleBBox.contains(pos)

            if (!visible) {
              this.zoom()
            }
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
      this.resultsLayer.addLayer(this.layer)
    },
    pin () {
      if (!this.layer) {
        return
      }

      this.resultsLayer.removeLayer(this.layer)
      this.map.addLayer(this.layer)

      const t = this.layerType === 'WMS' ? this.layerOptions.layerDescriptor.title : this.layerOptions.title
      this.map.layerswitcher.addOverlay(this.layer, t, { layerType: this.layerType })
    }
  }
}
</script>
