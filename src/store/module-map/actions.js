import { defaultsDeep } from 'lodash'

import except from '../../lib/except'
import { createExternalLayer, createLayer } from '../../lib/geomUtils'
import validate from '../../lib/validate'

import FeaturePopup from '../../components/FeaturePopup'

import { LAYER_TEMPLATE, LAYER_TEMPLATE_DEFAULTS } from './constants'

export function invalidateOffset (context) {
  const padding = context.rootGetters['layout/hiddenMap']
  context.state.mapObject.setGlobalPadding(padding)
}

export function invalidateSize (context) {
  context.state.mapObject.invalidateSize()
}

export function draw (context, type) {
  const oldTool = context.rootState.currentTool
  context.commit('setCurrentTool', 'draw', { root: true })

  const promise = createLayer({ map: context.state.mapObject, type: type.toLowerCase() })
  promise.then(() => {}, () => {}).then(() => {
    context.commit('setCurrentTool', oldTool, { root: true })
  })
  return promise
}

export function stopDrawing (context) {
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

export function addLayer (context, { layerDescriptor, title, options, metaOptions, auth = false }) {
  const map = context.state.mapObject
  const headers = auth ? context.rootGetters['auth/headers'] : void 0
  createExternalLayer({ layerDescriptor, title, options, map, popupComponent: FeaturePopup, metaOptions, headers })
    .then(({ type, layer }) => {
      map.addLayer(layer)

      const t = type === 'WMS' ? layerDescriptor.title : title
      map.layerswitcher.addOverlay(layer, t, { layerType: type })
    })
    .catch(e => {
      if (e) {
        except(e)
      }
    })
}

export function addSharedMarker (context, marker) {
  context.state.shared.addLayer(marker)
}

export function addDefaultLayers (context) {
  const layers = this.$config.defaultLayers
  if (!layers || layers.length <= 0) {
    return
  }
  layers.forEach(layer => {
    setTimeout(() => {
      const l = defaultsDeep(layer, LAYER_TEMPLATE_DEFAULTS)
      validate(l, LAYER_TEMPLATE)
      context.dispatch('addLayer', layer)
    }, 0)
  })
}
