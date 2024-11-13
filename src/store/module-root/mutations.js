export function setCurrentTool (state, value) {
  state.currentTool = value
}

export function setQuery (state, query) {
  if (query) {
    state.lastQuery = query
  }
  state.query = query
}
