import Vue from 'vue'

export function sources (state, value) {
  Vue.set(state, 'sources', value)
}

export function table (state, table) {
  state.table = table
}
