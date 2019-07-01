import { eachLayer, splitType } from './geomUtils'
import L from './leaflet'

function latlng2array ({ lat, lng }) {
  return [lng, lat]
}

function deepMap (value, callback) {
  if (Array.isArray(value)) {
    return value.map(v => deepMap(v, callback))
  } else {
    return callback(value)
  }
}

function extractArray (l) {
  if (l.getLatLng) {
    return latlng2array(l.getLatLng())
  } else if (l.getLatLngs) {
    return deepMap(l.getLatLngs(), latlng2array)
  } else {
    return null
  }
}

function extractCoordinates (layer) {
  if (layer instanceof L.LayerGroup) {
    const result = []
    eachLayer(layer, l => {
      result.push(extractArray(l))
    })
    return result
  } else {
    return extractArray(layer)
  }
}

export function getGeometry (layer, type) {
  if (!layer) {
    return null
  }

  const { isMulti } = splitType(type)

  let coordinates
  if (isMulti) {
    coordinates = []
    eachLayer(layer, l => coordinates.push(extractCoordinates(l)))
  } else {
    coordinates = extractCoordinates(layer)
  }

  return {
    type,
    coordinates
  }
}
