export function sources (state) {
  return state.sources || []
}

export function mapLoading (state) {
  return state.table && state.table.remote.fetching
}
