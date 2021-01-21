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
      ...(this.data && this.data.options && this.data.options.single_image && { singleTile: true }),
      ...this.options
    }

    return {
      id: !isVoid(this.data.giscube_id) && new GiscubeRef(this.data.giscube_id),
      layerDescriptor,
      title: this.data.title,
      options,
      metaOptions: {
        root
      },
      auth: this.data.private
    }
  }

  static create (data) {
    return new CatalogResult(data)
  }
}
