import axios from 'axios'
import L from '../../lib/leaflet'
import makeGeoJsonOptions from '../../lib/makeGeoJsonOptions'

import FeaturePopup from '../../components/FeaturePopup'

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
export function addLayer (context, { layerDescriptor, title }) {
  const type = layerDescriptor.type
  if (type && typeof type === 'string') {
    const action = addLayerActions[type.toLowerCase()]
    if (action) {
      context.dispatch(action, { layerDescriptor, title })
      return
    }
  }

  console.warn(`Trying to add layer of unknown type "${type}"`)
}

export function addLayerWMS (context, { layerDescriptor, title }) {
  const map = context.state.mapObject
  const wms = L.tileLayer.wms(layerDescriptor.url, {
    layers: layerDescriptor.layers,
    format: 'image/png',
    transparent: true,
    maxZoom: 22
  }).addTo(map)
  map.layerswitcher.addOverlay(wms, layerDescriptor.title, {
    layerType: 'WMS'
  })
}

export function addLayerTMS (context, { layerDescriptor, title }) {
  const map = context.state.mapObject
  const tms = L.tileLayer(layerDescriptor.url, {
    transparent: true,
    maxZoom: 22
  }).addTo(map)
  map.layerswitcher.addOverlay(tms, title)
}

export function addLayerGeoJSON (context, { layerDescriptor, title }) {
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
    .catch(console.error)
}
