import axios from 'axios'
import L from '../../lib/leaflet'
import Vue from 'vue'

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
      const options = {}
      const style = response.data.metadata.style

      if (style.shapetype.toLowerCase() === 'circle') {
        var geojsonMarkerOptions = {
          radius: style.shape_radius,
          fillColor: style.fill_color,
          color: style.stroke_color,
          weight: style.stroke_width,
          opacity: 1,
          fillOpacity: style.fill_opacity
        }

        options['pointToLayer'] = (feature, latlng) => {
          return L.circleMarker(latlng, geojsonMarkerOptions)
        }
      }

      options['onEachFeature'] = (feature, layer) => {
        const handler = () => {
          layer.off('click', handler)

          const PopupContent = Vue.extend(FeaturePopup)
          const popup = new PopupContent({
            propsData: { feature, title }
          })
          layer.bindPopup(popup.$mount().$el).openPopup()
        }
        layer.on('click', handler)
      }

      const geojson = L.geoJson(response.data, options).addTo(map)
      map.layerswitcher.addOverlay(geojson, title)
    })
    .catch(console.error)
}
