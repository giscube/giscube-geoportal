export function editLayerModified (state) {
  const geojson = state.geojson
  const originals = state.editStatus.originals

  return originals && (Object.keys(originals).length > 0 || geojson.some((feature, index) => feature.status.deleted))
}

export function sources (state) {
  return state.sources || []
}

export function geojson (state) {
  return state.geojson
}

export function editing (state) {
  return state.editStatus.editing
}

export function layerLoaded (state) {
  return state.layerConfig.layerInfo !== null
}

export function fields (state) {
  const layerInfo = state.layerConfig.layerInfo
  if (layerInfo) {
    return layerInfo.fields.filter(field => field.name !== layerInfo.geom_field)
  }
}

export function changed (state) {
  return Object.keys(state.editStatus.originals).length > 0 || state.table.features.some(feature => feature.status.deleted)
}

export function visibleSelected (state) {
  const features = state.table.features
  const selected = state.table.selected
  return selected.filter(s => features.some(f => f.id === s.id))
}
