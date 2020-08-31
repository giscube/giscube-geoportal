import axios from 'axios'
import databaseLayersApi from 'src/api/databaselayers'
import { CancelError, makeReactiveTooltip } from 'src/lib/geomUtils'
import { Field } from 'src/lib/field'
import { jsonFileToObject } from 'src/lib/fileutils'
import { map } from 'src/lib/itertools'
import { groupPointsByPolygons } from 'src/lib/layersInGeom'
import L from 'src/lib/leaflet'

import { DEFAULT_COLOR, DEFAULT_COLOR_MAP, PROPERTIES_PATH } from './constants'

function featureToLayer (feature) {
  const layer = L.GeoJSON.geometryToLayer(feature)
  layer.feature = feature
  return layer
}

async function getByOption (option) {
  if (!option.url) {
    return
  }
  const { data } = await axios.get(option.url)
  return data
}

export function clearFilters ({ commit }) {
  commit('filter', '')
  commit('colFilters', {})
  commit('filterPolygon', null)
}

export function clearStats ({ commit, dispatch }) {
  dispatch('clearFilters')
  commit('aggregatedData', null)
  commit('byOption', null)
  commit('by', null)
  dispatch('aggregate')
}

export async function selectBy ({ state, commit, dispatch, rootState }, { option, tooltip = {} } = {}) {
  commit('byOption', option)

  const geoJSON = option.file ? await jsonFileToObject(option.file) : await getByOption(option)
  const by = L.geoJSON(geoJSON)
  by.setStyle({
    color: DEFAULT_COLOR,
    weight: 1,
    fillOpacity: 0.9
  })

  for (let layer of by.getLayers()) {
    const tt = makeReactiveTooltip(
      tooltip.Component,
      {
        parent: tooltip.parent,
        propsData: { layer }
      },
      { className: 'statistics-result' }
    )
    layer.bindTooltip(tt)
  }

  commit('by', by)
  by.addTo(rootState.map.mapGroup)
  dispatch('aggregate')
}

export async function setAggregated ({ commit, dispatch }, { layers, title }) {
  if (typeof layers === 'string' || layers instanceof String) {
    layers = JSON.parse(layers)
  }

  if (Array.isArray(layers)) {
    if (layers.length > 0 && !(layers[0] instanceof L.Layer)) {
      layers = layers.map(featureToLayer)
    }
  } else if (layers.getLayers) {
    layers = layers.getLayers()
  } else {
    return
  }

  Object.freeze(layers) // Better performance in data table
  commit('aggregatedData', layers)
  commit('aggregatedTitle', title)
  dispatch('computeAggregatedFields')
}

export function setFields ({ commit }, fields) {
  fields.forEach(field => {
    field.path = PROPERTIES_PATH.concat(field.path)
    return field
  })
  commit('aggregatedFields', fields)
}

export function toggleFilterPolygon (context) {
  if (context.state.filterPolygon) {
    context.dispatch('setFilterPolygon', null)
  } else {
    context.dispatch('map/draw', 'polygon', { root: true })
      .then(layerPolygon => {
        context.dispatch('setFilterPolygon', layerPolygon)
      })
      .catch(e => {
        if (e instanceof CancelError) {
          const layerPolygon = e.layer
          if (layerPolygon) {
            context.dispatch('setFilterPolygon', layerPolygon)
          }
        } else {
          this.$except(e)
        }
      })
  }
}

export function setFilterPolygon (context, layerPolygon) {
  if (layerPolygon) {
    layerPolygon.disableEdit()
  }
  context.commit('filterPolygon', layerPolygon)

  if (layerPolygon) {
    layerPolygon.setStyle({ opacity: 0.5 })
    layerPolygon.addTo(context.rootState.map.mapObject)
  }
}

export async function loadData ({ state, commit, dispatch, rootGetters }, { source, layer, title }) {
  commit('aggregatedData', [])
  const layers = []

  const loading = state.processes.loading
  const pagination = { page: 1, rowsPerPage: 500 }
  const request = { source, layer, pagination }

  let data
  let totalPages = 1

  for (; pagination.page <= totalPages; ++pagination.page) {
    const response = await databaseLayersApi.getData(request, rootGetters['auth/config'])
    data = response.data
    pagination.rowsPerPage = data.page_size
    totalPages = data.total_pages

    loading.current = data.to
    loading.total = data.count
    Array.prototype.push.apply(layers, data.features.map(featureToLayer))
  }

  commit('resetLoading')
  Object.freeze(layers) // Better performance in data table
  commit('aggregatedData', layers)
  commit('aggregatedTitle', title)
}

export function computeAggregatedFields ({ state, commit }) {
  const rows = state.aggregatedData
  if (!rows || rows.length <= 0) {
    commit('aggregatedFields', [])
    return
  }

  const properties = PROPERTIES_PATH.extractFrom(rows[0])
  const fields = Object.keys(properties).map(property => {
    const field = new Field({ name: property })
    field.path = PROPERTIES_PATH.concat(field.path)
    return field
  })
  Object.freeze(fields)
  commit('aggregatedFields', fields)
}

export function aggregate ({ state, commit, dispatch }) {
  if (!state.aggregated || !state.by) {
    commit('result', null)
    dispatch('calculateColors')
    return
  }

  const groups = groupPointsByPolygons(state.aggregated, state.by)
  const aggregation = new WeakMap(
    map(
      state.by,
      layer => {
        const group = groups.get(layer)
        return [
          layer,
          {
            count: group ? group.length : 0
          }
        ]
      }
    )
  )

  commit('result', aggregation)
  dispatch('calculateColors')
}

export function setPaletteScheme ({ commit, dispatch }, value) {
  commit('paletteScheme', value)
  dispatch('calculateColors')
}

export function setPaletteGroups ({ commit, dispatch }, value) {
  commit('paletteGroups', value)
  dispatch('calculateColors')
}

export function calculateColors ({ state, commit }) {
  const colorMap = new Map(DEFAULT_COLOR_MAP)

  if (!state.result) {
    commit('colorMap', colorMap)
    return
  }

  if (!state.palette) {
    state.byLayer && state.byLayer.setStyle({
      color: DEFAULT_COLOR
    })
    commit('colorMap', colorMap)
    return
  }

  // compute limits
  let min = Infinity
  let max = -Infinity

  for (let layer of state.by) {
    const v = state.result.get(layer).count
    min = Math.min(min, v)
    max = Math.max(max, v)
  }

  const diff = max - min
  const scheme = state.palette.scheme
  const n = Math.min(Math.max(state.palette.groups, scheme.minGroups), scheme.maxGroups)
  const palette = scheme.groups[n]
  for (let layer of state.by) {
    let index
    if (diff > 0) {
      const p = state.result.get(layer).count
      const t = n * (p - min) / diff
      index = Math.min(isNaN(t) ? 0 : Math.floor(t), n - 1)
    } else {
      index = 0
    }
    const color = palette[index]

    colorMap.set(layer, color)
    layer.setStyle({ fillColor: color })
  }

  commit('colorMap', colorMap)
}
