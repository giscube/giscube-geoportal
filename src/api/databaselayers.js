import axios from 'axios'
import { throwUnhandledExceptions } from '../lib/promiseUtils.js'

export default {
  getLayerInfo (editSource, layer) {
    var config = {
      timeout: 10000
    }
    const url = editSource.url + `layerserver/databaselayers/${layer.slug}/`
    const request = axios.get(url, config)
    return throwUnhandledExceptions(request)
  },
  getLayers (editSource) {
    var config = {
      timeout: 10000
    }
    const url = editSource.url + 'layerserver/databaselayers/'
    const request = axios.get(url, config)
    return throwUnhandledExceptions(request)
  },
  getData ({ source, layer, pagination, filter, colFilters, extraParams }) {
    const url = source.url + `layerserver/databaselayers/${layer.slug}/data/`
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

    const config = {
      timeout: 10000,
      params
    }
    const request = axios.get(url, config)
    return throwUnhandledExceptions(request)
  },
  edit (target, changes) {
    const nChanges = changes.ADD.length + changes.UPDATE.length + changes.DELETE.length
    if (nChanges === 0) {
      return
    }
    const url = target.source.url + `layerserver/databaselayers/${target.layer.slug}/bulk/`
    const config = {
      timeout: 10000
    }
    const request = axios.post(url, changes, config)
    return throwUnhandledExceptions(request)
  }
}
