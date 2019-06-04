import databaseLayersApi from 'src/api/databaselayers'
import { INTERNAL_PROPERTY, isCleanEqual } from 'src/lib/utils'
import { promisedDebounce } from 'src/lib/FuturePromise'
import TableInfo from './TableInfo'

export const pageSizes = [
  20,
  50,
  100,
  500,
  1000,
  5000,
  10000
]

const _is = Object.freeze({
  source (value) {
    return isCleanEqual(this.source, value)
  },
  layer (value) {
    return isCleanEqual(this.layer, value)
  },
  sourceName (value) {
    return isCleanEqual(this.source.name, value)
  },
  layerName (value) {
    return isCleanEqual(this.layer.name, value)
  }
})

export default class Remote {
  constructor (source, layer, getConfig) {
    this.source = source
    this.layer = layer

    this.fetching = false

    this.filters = {
      bbox: null,
      columns: {},
      general: null,
      polygon: null
    }
    this.pagination = {
      rowsPerPage: 20,
      page: 1,
      rowsNumber: 0
    }
    this.info = null

    // internals
    Object.defineProperties(this, {
      _debouncedRequestData: {
        ...INTERNAL_PROPERTY,
        value: promisedDebounce(() => this.requestData(this.pagination, this.getConfig()), 500)
      },
      getConfig: {
        ...INTERNAL_PROPERTY,
        value: getConfig
      }
    })
  }

  get working () {
    return this.fetching
  }

  debouncedRequestData (pagination) {
    if (pagination) {
      this.pagination = pagination
    }
    return this._debouncedRequestData()
  }

  fetchInfo () {
    return databaseLayersApi.getLayerInfo(this.source, this.layer, this.getConfig())
      .then(response => {
        this.info = new TableInfo(response.data)
        return this.info
      })
  }

  is (values) {
    const keys = Object.keys(values)
    return keys.length > 0 && keys.every(k => {
      return _is[k] && _is[k].call(this, values[k])
    })
  }

  requestData (pagination) {
    if (this.fetching) {
      return Promise.reject()
    }
    this.fetching = true

    if (pagination === void 0) {
      pagination = this.pagination
    }

    const args = {
      source: this.source,
      layer: this.layer,
      pagination,
      filter: this.filters.general,
      colFilters: this.filters.columns
    }

    if (this.info.hasGeom) {
      const bbox = this.filters.bbox && this.filters.bbox().join(',')
      args['extraParams'] = {
        in_bbox: bbox || void 0,
        intersects: this.filters.polygon || void 0
      }
    }

    return new Promise((resolve, reject) => {
      databaseLayersApi.getData(args, this.getConfig())
        .then(response => {
          const { data } = response

          this.pagination = pagination
          this.pagination.rowsNumber = data.count
          this.pagination.page = data.page
          this.pagination.rowsPerPage = data.page_size

          this.fetching = false

          resolve(data)
        })
        .catch(error => {
          this.fetching = false
          reject(error)
        })
    })
  }

  save (bulk) {
    return databaseLayersApi.edit(this, bulk, this.getConfig())
  }

  setPolygonFilter (layer) {
    if (!layer) {
      this.filters.polygon = null
    } else {
      const coords = layer.getLatLngs()[0]
      const coord2str = c => `${c.lng} ${c.lat}`
      const strCoords = coords.map(coord2str).join(', ') + ', ' + coord2str(coords[0])
      this.filters.polygon = `POLYGON((${strCoords}))`
    }
  }
}
