import Vue from 'vue'

export function sources (state, value) {
  Vue.set(state, 'sources', value)
}

export function table (state, table) {
  if (state.table) {
    state.table.remote.cancelRequests()
  }
  state.table = table
}
