export function mapObject (state, value) {
  if (value) {
    state.shared.remove()
    state.shared.addTo(value)
  }
  state.mapObject = value
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
