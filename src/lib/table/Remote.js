import { CancelToken, isCancel } from 'axios'
import Vue from 'vue'
import databaseLayersApi from 'src/api/databaselayers'
import { INTERNAL_PROPERTY, isCleanEqual, fromEntries } from 'src/lib/utils'
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
  constructor (source, layer, getConfig, constFields = {}) {
    this.source = source
    this.layer = layer

    this.fetching = false

    this.filters = {
      bbox: null,
      columns: {
        ...constFields
      },
      general: null,
      polygon: null
    }
    this.pagination = {
      rowsPerPage: 20,
      page: 1,
      rowsNumber: 0
    }
    this.info = null

    this.constFields = { ...constFields }

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

  cancelRequests () {
    if (this._cancelFetch) {
      this._cancelFetch()
    }
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
        this.info = new TableInfo(response.data, this.constFields)
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
    this.fetching = true

    if (pagination === void 0) {
      pagination = this.pagination
    } else {
      this.pagination = pagination
    }

    const colFilters = fromEntries(
      Object.entries(this.filters.columns)
        .map(([fieldName, filter]) => {
          const field = this.info.fieldsDict[fieldName]
          if (field) {
            return field.search(filter)
          }
        })
        .filter(v => !!v)
    )

    const args = {
      source: this.source,
      layer: this.layer,
      pagination,
      filter: this.filters.general,
      colFilters
    }

    if (this.info.hasGeom) {
      const bbox = this.filters.bbox && this.filters.bbox().join(',')
      args['extraParams'] = {
        in_bbox: bbox || void 0,
        intersects: this.filters.polygon || void 0
      }
    }

    const cancelToken = CancelToken.source()
    const cancel = cancelToken.cancel
    this._cancelFetch = cancel

    const config = {
      ...this.getConfig(),
      cancelToken: cancelToken.token
    }

    return new Promise((resolve, reject) => {
      databaseLayersApi.getData(args, config)
        .then(async response => {
          await Vue.nextTick()
          if (this._cancelFetch !== cancel) {
            resolve()
            return
          } else if (isCancel(response)) {
            this.fetching = false
            resolve()
          }

          const { data } = response

          this.pagination = pagination
          this.pagination.rowsNumber = data.count
          this.pagination.page = data.page
          this.pagination.rowsPerPage = data.page_size

          this.fetching = false

          resolve(data)
        })
        .catch(error => {
          if (isCancel(error)) {
            this.fetching = false
            resolve()
          } else {
            if (this._cancelFetch === cancel) {
              this.fetching = false
            }
            reject(error)
          }
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
