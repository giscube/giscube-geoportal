import Vue from 'vue'
import { visibleMapPart } from '../../lib/geomUtils.js'
import L from 'src/lib/leaflet'

export function bbox (state, getters, rootState, rootGetters) {
  if (!state.mapObject) {
    return () => {}
  }

  return () => {
    const visibility = {
      ...rootState.layout.size,
      ...rootGetters['layout/hiddenMap']
    }

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

export function baseMapIndex (state) {
  return Vue.prototype.$config.basemaps.indexOf(state.layers.baseLayer)
}

export function drawnLayers (state) {
  return () => {
    if (state.mapObject) {
      return state.mapObject.measureControl._layer.getLayers()
        .filter(l => !(l instanceof L.Marker))
        .map(l => l.getLayers()[0])
        .filter(l => state.mapObject.hasLayer(l))
    }
  }
}
