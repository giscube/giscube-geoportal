export function mapObject (state, value) {
  state.mapObject = value
}

export function _baseLayer (state, value) {
  /* For internal use. Use setBaseLayer action instead */
  state.layers.baseLayer = value
}

export function overlays (state, overlays) {
  state.layers.overlays = overlays
}

export function zoom (state, value) {
  state.state.zoom = value
}

export function center (state, value) {
  state.state.center = value
}

export function padding (state, padding) {
  state.mapObject.setGlobalPadding(padding)
}

export function drawing (state, value) {
  state.drawing = value
}

export function hideLayersControl (state, value) {
  state.hideLayersControl = value
}
