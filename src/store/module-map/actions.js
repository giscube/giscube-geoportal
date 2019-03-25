export function stopDrawing (state) {
  if (state.mapObject.editTools.drawing()) {
    state.mapObject.editTools.stopDrawing()
  }
}
