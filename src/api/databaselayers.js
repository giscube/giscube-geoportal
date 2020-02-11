import axios from 'axios'
import md5 from 'md5'
import { throwUnhandledExceptions } from '../lib/promiseUtils.js'

const requestCache = new WeakMap()

export default {
  getLayerInfo (editSource, layer, config) {
    var conf = {
      timeout: 10000,
      ...config
    }
    const url = editSource.url + `layerserver/databaselayers/${layer.name}/`
    const request = axios.get(url, conf)
    return throwUnhandledExceptions(request)
  },
  getLayers (editSource, config) {
    var conf = {
      timeout: 10000,
      ...config
    }
    const url = editSource.url + 'layerserver/databaselayers/'
    const request = axios.get(url, conf)
    return throwUnhandledExceptions(request)
  },
  getData ({ source, layer, pagination, filter, colFilters, extraParams }, config) {
    const url = source.url + `layerserver/databaselayers/${layer.name}/data/`
    const params = {
      page: pagination && pagination.page,
      page_size: pagination && pagination.rowsPerPage,
      ...extraParams
    }

    params.ordering = pagination && pagination.sortBy
    if (pagination && pagination.descending) {
      params.ordering = `-${params.ordering}`
    }

    if (filter) {
      params.q = filter
    }

    Object.keys(colFilters || {}).forEach(key => {
      params[key] = colFilters[key]
    })

    const conf = {
      params,
      ...config
    }
    const request = axios.get(url, conf)
    return throwUnhandledExceptions(request)
  },
  edit (target, changes, config) {
    const nChanges = changes.ADD.length + changes.UPDATE.length + changes.DELETE.length
    if (nChanges === 0) {
      return Promise.resolve()
    }
    const url = target.source.url + `layerserver/databaselayers/${target.layer.name}/bulk/`

    let request = requestCache.get(changes)
    if (!request) {
      request = {}
      const changesRequest = {
        ...changes,
        _META: { time: Date.now() }
      }
      request.body = JSON.stringify(changesRequest)
      request.hash = md5(request.body)
      requestCache.set(changes, request)
    }

    const conf = {
      timeout: 10000,
      headers: {},
      ...config
    }

    conf.headers = {
      ...conf.headers,
      'X-Bulk-Hash': request.hash,
      'Content-Type': 'application/json'
    }

    return throwUnhandledExceptions(axios.post(url, request.body, conf))
  }
}
