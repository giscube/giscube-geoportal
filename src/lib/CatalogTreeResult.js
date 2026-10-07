import GiscubeRef from 'src/lib/refs/giscube'
import { isVoid } from 'src/lib/utils'

export default class CatalogResult {
  constructor (data) {
    for (let [key, value] of Object.entries(data)) {
      Object.defineProperty(this, key, { value, writable: true, enumerable: true })
    }
  }

  get isLayer () {
    return this.geojson || (this.data.children && this.data.children.length > 0)
  }

  toLayer (root) {
    if (!this.isLayer) {
      return
    }

    const layerDescriptor = this.data.children[0]
    const options = {
      ...(layerDescriptor && layerDescriptor.giscube && layerDescriptor.giscube.single_image && { singleTile: true }),
      ...this.options,
      ...this.data.options
    }

    return {
      id: !isVoid(this.data.giscube_id) && new GiscubeRef(this.data.giscube_id, this.activeFilterIndexes()),
      layerDescriptor,
      title: this.data.title,
      options,
      metaOptions: {
        root
      },
      auth: this.data.private,
      filters: this.filters,
      legend: this.data.legend,
      overlappingGeometries: this.data.overlapping_geometries
    }
  }

  activeFilterIndexes () {
    if (!this.filters || this.filters.length === 0) {
      return null
    }
    return this.filters
      .map((filter, index) => filter.active ? index : null)
      .filter(index => index !== null)
  }

  static create (data) {
    return new CatalogResult(data)
  }
}
