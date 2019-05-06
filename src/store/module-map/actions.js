import axios from 'axios'
import except from '../../lib/except'
import L from '../../lib/leaflet'
import makeGeoJsonOptions from '../../lib/makeGeoJsonOptions'

import FeaturePopup from '../../components/FeaturePopup'

export function invalidateSize (context) {
  context.state.mapObject.invalidateSize()
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

const addLayerActions = {
  wms: 'addLayerWMS',
  tms: 'addLayerTMS',
  geojson: 'addLayerGeoJSON'
}
export function addLayer (context, { layerDescriptor, title, options }) {
  const type = layerDescriptor.type
  if (type && typeof type === 'string') {
    const action = addLayerActions[type.toLowerCase()]
    if (action) {
      context.dispatch(action, { layerDescriptor, title, options })
      return
    }
  }

  console.warn(`Trying to add layer of unknown type "${type}"`)
}

function applyExtraOptions (defaultOptions, extraOptions, allowedOptions) {
  const options = {}
  if (typeof extraOptions !== 'undefined') {
    for (const k in extraOptions) {
      if (allowedOptions.indexOf(k) !== -1) {
        options[k] = extraOptions[k]
      }
    }
  }
  return Object.assign(defaultOptions, options)
}

export function addLayerWMS (context, { layerDescriptor, title, options }) {
  const map = context.state.mapObject
  const defaultOptions = {
    layers: layerDescriptor.layers,
    format: 'image/png',
    transparent: true,
    maxZoom: 22
  }
  const allowedOptions = ['minZoom', 'maxZoom', 'layers', 'styles', 'format', 'transparent', 'format', 'version',
    'csr', 'uppercase', 'attribution']
  const layerOptions = applyExtraOptions(defaultOptions, options, allowedOptions)
  const wms = L.tileLayer.wms(layerDescriptor.url, layerOptions).addTo(map)
  map.layerswitcher.addOverlay(wms, layerDescriptor.title, {
    layerType: 'WMS'
  })
}

export function addLayerTMS (context, { layerDescriptor, title, options }) {
  const map = context.state.mapObject
  const defaultOptions = {
    transparent: true,
    maxZoom: 22
  }
  const allowedOptions = ['minZoom', 'maxZoom', 'tms', 'attribution']
  const layerOptions = applyExtraOptions(defaultOptions, options, allowedOptions)
  const tms = L.tileLayer(layerDescriptor.url, layerOptions).addTo(map)
  map.layerswitcher.addOverlay(tms, title)
}

export function addLayerGeoJSON (context, { layerDescriptor, title, options }) {
  const map = context.state.mapObject
  const dataUrl = layerDescriptor.url
  axios.get(dataUrl)
    .then(response => {
      response.data.metadata.styleRules = response.data.metadata.style_rules
      delete response.data.metadata.style_rules

      const options = makeGeoJsonOptions(response.data.metadata, {
        map,
        propsData: {
          title
        },
        popup: {
          component: FeaturePopup
        }
      })

      const geojson = L.geoJson(response.data, options).addTo(map)
      map.layerswitcher.addOverlay(geojson, title)
    })
    .catch(except.http)
}
