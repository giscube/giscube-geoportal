import { visibleMapPart } from '../../lib/geomUtils.js'

export function bbox (state, getters, rootState) {
  if (!state.mapObject) {
    return () => {}
  }

  return () => {
    const { bbox } = visibleMapPart(state.mapObject, { left: rootState.layout.leftDrawerSize, width: window.innerWidth })
    const result = [
      bbox.getSouthWest().lng, bbox.getSouthWest().lat,
      bbox.getNorthEast().lng, bbox.getNorthEast().lat
    ]
    return result
  }
}
