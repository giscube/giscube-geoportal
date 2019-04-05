import Vue from 'vue'

import L from '../lib/leaflet'
import { createGeom } from '../lib/feature'

export function draw (context, { keep = false, type = 'point', options = {} }) {
  return new Promise((resolve, reject) => {
    // Context objects
    const map = context.state.mapObject

    // Setup arguments
    type = type.toLowerCase()
    const multi = type.startsWith('multi')

    if (options.draggable === undefined) {
      options.draggable = false
    }

    // Logic
    let finalLayer = null

    function removeEvents () {
      map.off('editable:drawing:commit', commitGeom)
      map.off('editable:drawing:end', cancel)
      if (context.state._drawingControls) {
        Vue.remove(constext.state, '_drawingControls')
      }
    }

    function commit () {
      removeEvents()
      if (map.editTools.drawing()) {
        map.editTools.stopDrawing()
      }
      resolve(finalLayer)
    }

    function cancel () {
      removeEvents()
      if (map.editTools.drawing()) {
        map.editTools.stopDrawing()
      }
      if (finalLayer) {
        finalLayer.delete()
      }
      reject()
    }

    function commitGeom (layer) {
      if (multi) {
        finalLayer.addLayer(layer)
      } else {
        finalLayer = layer
        commit()
      }
    }

    function cancelGeom () {
      if (!multi) {
        cancel()
      }
    }

    map.on('editable:drawing:commit', commitGeom)
    map.on('editable:drawing:end', cancelGeom)
    if (multi) {
      Vue.set(constext.state, '_drawingControls', { commit, cancel })
    }

    createGeom(type, map, options)
  })
}

export function commitGeometry (context) {
  if (context.state.mapObject.editTools.drawing()) {
    context.state.mapObject.editTools.commitDrawing()
  }
}

export function commitDrawing (context) {
  context.dispatch('commitGeometry')
  context.state._drawingControls.commit()
}

export function cancelDrawing (context) {
  context.dispatch('cancelDrawing')
  context.state._drawingControls.cancel()
}

export function cancelDrawing (context) {
  if (context.state.mapObject.editTools.drawing()) {
    context.state.mapObject.editTools.stopDrawing()
  }
}

export function disableDoubleClickZoom (context) {
  context.state.mapObject.doubleClickZoom.disable()
}

export function enableDoubleClickZoom (context) {
  context.state.mapObject.doubleClickZoom.enable()
}
