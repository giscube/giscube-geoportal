import Vue from 'vue'

export function setInitialState (state) {
  state.table = null
  state.sources = null
}

export function sources (state, value) {
  Vue.set(state, 'sources', value)
}

export function table (state, table) {
  if (state.table) {
    state.table.onRemove()
  }
  state.table = table
}

export function filterPolygon (state, layer) {
  if (state.filterPolygon) {
    state.filterPolygon.remove()
  }
  state.filterPolygon = layer
}

export function clearLoadingSourceErrors (state) {
  Vue.set(state, 'loadingSourceErrors', [])
}

export function addLoadingSourceError (state, error) {
  state.loadingSourceErrors.push(error)
}
