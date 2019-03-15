export function mapObject (state, value) {
  state.mapObject = value
}

export function stopDrawing (state) {
  if (state.mapObject.editTools.drawing()) {
    state.mapObject.editTools.stopDrawing()
  }
}
