export function aggregatedData (state, value) {
  state.aggregatedData = value
}

export function aggregated (state, value) {
  state.aggregated = value
}

export function aggregatedTitle (state, value) {
  state.aggregatedTitle = value
}

export function aggregatedFields (state, value) {
  state.aggregatedFields = value
}

export function filter (state, value) {
  state.filter = value
}

export function colFilters (state, value) {
  state.colFilters = value
}

export function filterPolygon (state, layer) {
  if (state.filterPolygon) {
    state.filterPolygon.remove()
  }
  state.filterPolygon = layer
}

export function byOption (state, value) {
  state.byOption = value
}

export function by (state, value) {
  if (value && value.getLayers) {
    state.by = value.getLayers()
  } else {
    state.by = value
  }
  if (state.byLayer) {
    state.byLayer.remove()
  }
  state.byLayer = value
}

export function result (state, value) {
  state.result = value
}

export function paletteScheme (state, value) {
  state.palette.scheme = value
}

export function paletteGroups (state, value) {
  state.palette.groups = value
}

export function colorMap (state, value) {
  state.colorMap = value
}

export function resetLoading (state) {
  const loading = state.processes.loading
  loading.current = 0
  loading.total = 0
}

export function legend (state, value) {
  state.legend = value
}

export function keyLabel (state, value) {
  state.keyLabel = value
}

export function valueLabel (state, value) {
  state.valueLabel = value
}
