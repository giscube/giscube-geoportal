export function bbox (state) {
  if (!state.mapObject) {
    return () => {}
  }

  return () => {
    const mapInfo = state.mapObject.giscube.getMapInfo()
    const bbox = mapInfo.visibleBounds
    const result = [
      bbox.getSouthWest().lng, bbox.getSouthWest().lat,
      bbox.getNorthEast().lng, bbox.getNorthEast().lat
    ]
    return result
  }
}
