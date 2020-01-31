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
    state.table.remote.cancelRequests()
  }
  state.table = table
}

export function clearLoadingSourceErrors (state) {
  Vue.set(state, 'loadingSourceErrors', [])
}

export function addLoadingSourceError (state, error) {
  state.loadingSourceErrors.push(error)
}

export function updateWms (state, promise) {
  state.updateWms = promise
}
