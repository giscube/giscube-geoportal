import { CancelToken, isCancel } from 'axios'
import Vue from 'vue'
import databaseLayersApi from 'src/api/databaselayers'
import { map, join } from 'src/lib/itertools'
import { INTERNAL_PROPERTY, isCleanEqual, fromEntries } from 'src/lib/utils'
import TableInfo, { DEFAULT_PAGE_SIZE } from './TableInfo'

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
      columns: {},
      general: null,
      point: null,
      polygon: null,
      deleted: new Set()
    }
    this.pagination = {
      rowsPerPage: DEFAULT_PAGE_SIZE,
      page: 1,
      rowsNumber: 0
    }
    this.info = null

    this.constFields = { ...constFields }

    // internals
    Object.defineProperties(this, {
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

  fetchInfo () {
    return databaseLayersApi.getLayerInfo(this.source, this.layer, this.getConfig())
      .then(response => {
        this.info = new TableInfo(response.data, this.constFields)
        this.pagination.rowsPerPage = this.info.rowsPerPage
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
      colFilters: { ...colFilters, ...this.constFields }
    }

    if (this.info.hasGeom) {
      const bbox = this.filters.bbox && this.filters.bbox().join(',')
      args['extraParams'] = {
        in_bbox: bbox || void 0,
        intersects: this.filters.polygon || this.filters.point || void 0,
        [this.info.pkField.name + '__in!']: join(this.filters.deleted)
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

  requestSpecificData (rows) {
    const args = {
      source: this.source,
      layer: this.layer,
      extraParams: {
        [this.info.pkField.name + '__in']: join(map(rows, row => row.pk))
      }
    }
    return databaseLayersApi.getData(args, this.getConfig())
  }

  save (bulk) {
    return databaseLayersApi.edit(this, bulk, this.getConfig())
  }

  setPointFilter (layer) {
    if (!layer) {
      this.filters.point = null
    } else {
      const coords = layer.getLatLngs()[0].map(c => `${c.lng},${c.lat}`)
      const strCoords = [...coords, coords[0]].join(',')
      this.filters.point = strCoords
    }
  }

  setPolygonFilter (layer) {
    if (!layer) {
      this.filters.polygon = null
    } else {
      const coords = layer.getLatLngs()[0].map(c => `${c.lng},${c.lat}`)
      const strCoords = [...coords, coords[0]].join(',')
      this.filters.polygon = strCoords
    }
  }
}
