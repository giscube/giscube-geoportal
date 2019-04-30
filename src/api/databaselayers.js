import axios from 'axios'
import { throwUnhandledExceptions } from '../lib/promiseUtils.js'

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
      page: pagination.page,
      page_size: pagination.rowsPerPage,
      ...extraParams
    }

    params.ordering = pagination.sortBy
    if (pagination.descending) {
      params.ordering = `-${params.ordering}`
    }

    if (filter) {
      params.q = filter
    }

    Object.keys(colFilters).forEach(key => {
      params[key] = colFilters[key]
    })

    const conf = {
      timeout: 10000,
      params,
      ...config
    }
    const request = axios.get(url, conf)
    return throwUnhandledExceptions(request)
  },
  edit (target, changes, config) {
    const nChanges = changes.ADD.length + changes.UPDATE.length + changes.DELETE.length
    if (nChanges === 0) {
      return
    }
    const url = target.source.url + `layerserver/databaselayers/${target.layer.name}/bulk/`
    const conf = {
      timeout: 10000,
      ...config
    }
    const request = axios.post(url, changes, conf)
    return throwUnhandledExceptions(request)
  }
}
