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
    headers: isAuthenticated ? $root.$store.getters['auth/headers'] : void 0,
    overlappingGeometries: result.overlapping_geometries
  }
}

export default class GiscubeRef {
  constructor (id, activeFilters = null) {
    this.plainRef = id.toString()
    this.activeFilters = activeFilters && activeFilters.length > 0 ? activeFilters : null
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

  async syncCatalogFilters ($root) {
    if (!this.activeFilters) {
      return
    }
    const leaf = await $root.$store.dispatch('catalogTree/searchInCatalog', this.plainRef)
    if (leaf && leaf.filters && leaf.filters.length > 0) {
      const value = leaf.filters.map((filter, index) => ({
        ...filter,
        active: this.activeFilters.includes(index)
      }))
      $root.$store.dispatch('catalogTree/setNodePropertyValue', { id: this.plainRef, property: 'filters', value })
      $root.$store.dispatch('catalogTree/setNodePropertyValue', { id: this.plainRef, property: 'expandFilters', value: true })
      $root.$store.dispatch('catalogTree/expandToNode', this.plainRef)
    }
  }

  async openInSidebar ({ context, $router }) {
    const result = await context.dispatch('catalogTree/getResultById', this.plainRef, { root: true })
    if (result) {
      $router.push({ name: 'place', params: { q: result.title } })
    }
  }

  async overlayerAsResult (result, opacity, $root) {
    const layerOptions = extractResultOptions(result, $root)
    if (this.activeFilters && result.filters && result.filters.length > 0) {
      layerOptions.filters = result.filters.map((filter, index) => ({
        ...filter,
        active: this.activeFilters.includes(index)
      }))
    }
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
      legend: result && result.legend,
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
