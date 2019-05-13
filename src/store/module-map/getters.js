import { visibleMapPart } from '../../lib/geomUtils.js'

export function bbox (state, getters, rootState, rootGetters) {
  if (!state.mapObject) {
    return () => {}
  }

  return () => {
    const sidebarOverlaying = rootGetters['layout/drawersFullOverlay']
    const sidebarVisible = rootState.layout.sidebarVisible

    const visibility = (!sidebarOverlaying && sidebarVisible) ? {
      left: rootState.layout.leftDrawerSize,
      width: rootState.layout.size.width
    } : {}

    const { bbox } = visibleMapPart(state.mapObject, visibility)
    return bbox
  }
}

export function drfgBbox (state, getters, rootState, rootGetters) {
  // Generates a bounding box with Django Rest Framework GIS' format
  //
  // Specification: https://github.com/djangonauts/django-rest-framework-gis#inbboxfilter
  //

  if (!state.mapObject) {
    return () => {}
  }

  return () => {
    const bbox = getters.bbox()
    const result = [
      bbox.getSouthWest().lng, bbox.getSouthWest().lat,
      bbox.getNorthEast().lng, bbox.getNorthEast().lat
    ]
    return result
  }
}
