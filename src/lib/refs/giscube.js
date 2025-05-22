import { createLayerFromConfig } from 'src/lib/geomUtils'

import FeaturePopup from 'components/FeaturePopup'
import FeaturePopupDialog from 'components/FeaturePopupDialog'
import SearchResultPopupDialog from 'components/SearchResultPopupDialog'

function extractResultOptions (result, $root) {
  const isGeojson = !!result.geojson
  const isAuthenticated = result.private || (result.origin && result.origin.auth)
  const layerDescriptor = result.children && result.children.length > 0 && result.children[0]
  const options = {
    ...(layerDescriptor && layerDescriptor.giscube && layerDescriptor.giscube.single_image && { singleTile: true }),
    ...result.options
  }

  return {
    result,
    layerDescriptor,
    title: result && result.title,
    options,
    map: $root.$store.state.map.mapObject,
    popupComponent: isGeojson ? this.$config.tools.search.searchResultPopup : FeaturePopup,
    dialogComponent: isGeojson ? SearchResultPopupDialog : FeaturePopupDialog,
    metaOptions: {
      root: $root
    },
    headers: isAuthenticated ? $root.$store.getters['auth/headers'] : void 0
  }
}

export default class GiscubeRef {
  constructor (id) {
    this.plainRef = id.toString()
  }

  toPlainRef () {
    return this.plainRef
  }

  equals (other) {
    return this.plainRef === other.plainRef
  }

  canOpen () {
    return true
  }

  async openInSidebar ({ context, $router }) {
    const result = await context.dispatch('catalogTree/getResultById', this.plainRef, { root: true })
    if (result) {
      $router.push({ name: 'place', params: { q: result.title } })
    }
  }

  async overlayerAsResult (result, opacity, $root) {
    const layerOptions = extractResultOptions(result, $root)
    const { type, layer } = await createLayerFromConfig(layerOptions) // TODO save table
    const name = type === 'WMS' ? layerOptions.layerDescriptor.title : layerOptions.title

    const getfeatureinfoSupport =
      layerOptions.layerDescriptor.giscube &&
      layerOptions.layerDescriptor.giscube.getfeatureinfo_support

    return {
      id: this,
      layer,
      layerType: type,
      options: layerOptions.options,
      getfeatureinfoSupport,
      name,
      opacity
    }
  }

  async getAsResult (opacity, $root) {
    const result = await $root.$store.dispatch('catalogTree/getResultById', this.plainRef)

    if (!result) {
      return () => {}
    }

    return this.overlayerAsResult(result, opacity, $root)
  }

  async addAsResult (opacity, $root) {
    const result = await $root.$store.dispatch('catalogTree/getResultById', this.plainRef)

    if (!result) {
      return () => {}
    }

    await this.overlayerAsResult(result, opacity, $root).then((overlay) => {
      $root.$store.dispatch('map/addOverlay', overlay)
    })
  }
}
