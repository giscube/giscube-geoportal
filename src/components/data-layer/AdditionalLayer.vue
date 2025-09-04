<template>
  <div class="q-pb-md">
    <q-btn
      v-if="!overlayShowed"
      :label="t('showAdditionalLayer')"
      @click="showAdditionalLayer()"
    />
    <q-btn
      v-if="overlayShowed"
      :label="t('hideAdditionalLayer')"
      class="q-ml-sm"
      @click="removeAdditionalLayer()"
    />
  </div>
</template>

<script>
import Vue from 'vue'

import { QBtn } from 'quasar'
import { isVoid } from 'src/lib/utils'
import { mapState } from 'vuex'
import FeaturePopup from 'src/components/FeaturePopup'
import FeaturePopupDialog from 'src/components/FeaturePopupDialog'
import SearchResultPopupDialog from 'src/components/SearchResultPopupDialog'
import { createLayerFromConfig } from 'src/lib/geomUtils'

import geoportalApi from 'src/api/geoportal'

import GiscubeRef from 'src/lib/refs/giscube'

import TranslationMixin from './TranslationMixin'

export default {
  name: 'AdditionalLayer',
  mixins: [TranslationMixin],
  props: ['result'],
  components: {
    QBtn
  },
  data () {
    return {
      layer: null,
      layerType: null
    }
  },
  computed: {
    ...mapState({
      map: state => state.map.mapObject,
      overlays: state => state.map.layers.overlays,
      resultsLayer: state => state.search.resultsLayer
    }),
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
          name: this.$t('names.url'),
          text: text,
          href: url,
          type: type
        })
        if (type && type.toLowerCase() === 'tms' && this.layerOptions.layerDescriptor.bbox) {
          layerDescriptor[0]['bbox'] = this.layerOptions.layerDescriptor.bbox
        }
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
      const getfeatureinfoSupport = layerDescriptor && layerDescriptor.giscube && layerDescriptor.giscube.getfeatureinfo_support
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
        downloads,
        getfeatureinfoSupport
      }
    },
    overlay () {
      const overlay = this.overlays.filter(overlay => { return this.result && this.result.giscube_id === overlay.id.plainRef })
      return overlay && overlay.length > 0 && overlay[0]
    },
    overlayShowed () {
      return this.overlay
    }
  },
  methods: {
    showAdditionalLayer () {
      this.pin()
    },
    applyResult () {
      createLayerFromConfig(this.layerOptions)
        .then(({ type, layer, _ }) => {
          geoportalApi.newLayerRegister(this.$config.registers, this.layerOptions, this.$store.getters['auth/config'], this.$store.state.auth.username)
          this.layerType = type
          if (this.overlay) {
            this.layer = this.overlay.layer
          } else {
            this.layer = layer
          }

          if (type === 'GeoJSON') {
            this.layer.openPopup()
            if (this.isExternalSearchResult) {
              const latlngPoint = layer.getPopup().getLatLng()
              this.layer.closePopup()
              this.map.fireEvent('click', {
                latlng: latlngPoint,
                layerPoint: this.map.latLngToLayerPoint(latlngPoint),
                containerPoint: this.map.latLngToContainerPoint(latlngPoint)
              })
            }
          }
        })
        .catch(e => {
          if (e) {
            this.$except(e)
          }
        })
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
      const overlay = {
        id,
        layer: this.layer,
        layerType: this.layerType,
        options: this.layerOptions.options,
        getfeatureinfoSupport,
        name
      }
      this.$store.dispatch('map/addOverlay', overlay)

      if (!this.result.giscube_id) {
        if (typeof this.layer.getLayers === 'function') {
          this.layer.getLayers().forEach(l => {
            Vue.set(l, 'sharedMessage', overlay.name)
            this.$store.dispatch('map/addPinLayer', l)
          })
        } else {
          Vue.set(this.layer, 'sharedMessage', overlay.name)
          this.$store.dispatch('map/addPinLayer', this.layer)
        }
      }
    },
    removeAdditionalLayer () {
      this.$store.dispatch('map/removeOverlay', this.overlay)
    }
  },
  watch: {
    'layerOptions': {
      handler: 'applyResult',
      immediate: true
    }
  }
}
</script>
