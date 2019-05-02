import { visibleMapPart } from '../../lib/geomUtils.js'

export function bbox (state, getters, rootState, rootGetters) {
  if (!state.mapObject) {
    return () => {}
  }

  return () => {
    const sidebarOverlaying = rootGetters['layout/drawersOverlaying']
    const sidebarVisible = rootState.layout.sidebarVisible
    const visibility = sidebarOverlaying || !sidebarVisible ? {} : {
      left: rootState.layout.leftDrawerSize,
      width: rootState.layout.size.width
    }

    const { bbox } = visibleMapPart(state.mapObject, visibility)
    const result = [
      bbox.getSouthWest().lng, bbox.getSouthWest().lat,
      bbox.getNorthEast().lng, bbox.getNorthEast().lat
    ]
    return result
  }
}
