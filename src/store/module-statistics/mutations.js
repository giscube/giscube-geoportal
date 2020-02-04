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

export function byOption (state, value) {
  state.byOption = value
}

export function by (state, value) {
  state.by = value.getLayers()
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
