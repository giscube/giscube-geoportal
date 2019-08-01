import Vue from 'vue'

export function setInitialState (state) {
  state.defaultRow = null
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
  state.defaultRow = null
}

export function resetDefault (state) {
  state.defaultRow = state.table.newRow()
}
