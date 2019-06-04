import L from 'src/lib/leaflet'
import except from '../../lib/except'
import { createExternalLayer, createLayer } from '../../lib/geomUtils'

import FeaturePopup from '../../components/FeaturePopup'

export function invalidateOffset (context) {
  const padding = context.rootGetters['layout/hiddenMap']
  context.state.mapObject.setGlobalPadding(padding)
}

export function invalidateSize (context) {
  context.state.mapObject.invalidateSize()
}

export function draw (context, type) {
  return createLayer({ map: context.state.mapObject, type: type.toLowerCase() })
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

export function addLayer (context, { layerDescriptor, title, options }) {
  const map = context.state.mapObject
  createExternalLayer({ layerDescriptor, title, options, map, popupComponent: FeaturePopup })
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

export function addSharedMarker (context, latlng) {
  const marker = L.marker(latlng)
  context.state.shared.addLayer(marker)
}
