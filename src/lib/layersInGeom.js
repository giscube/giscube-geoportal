import L from './leaflet.js'
import pointInPolygon from 'point-in-polygon'

const resultFound = Symbol('Found a result (skipping the rest)')

function endableCallback (callback) {
  return p => {
    if (callback.call(this, p)) {
      throw resultFound
    }
  }
}

function eachPoint (layer, callback) {
  const cb = endableCallback(callback)
  if (layer instanceof L.LayerGroup) {
    layer.eachLayer(l => eachPoint(l, cb))
  } else if (layer instanceof L.Polygon) {
    layer.getLatLngs()[0].forEach(cb)
  } else if (layer instanceof L.Polyline) {
    layer.getLatLngs().forEach(cb)
  } else if (layer instanceof L.CircleMarker) {
    cb(layer.getLatLng())
  } else if (layer instanceof L.LatLng) {
    cb(layer)
  }
}

const toRaw = p => [p.lat, p.lng]
function contains (layer, geomLatlongs, bounds) {
  const rawLatLngs = geomLatlongs[0].map(toRaw)
  eachPoint(layer, p => bounds.contains(p) && pointInPolygon(toRaw(p), rawLatLngs))
}

export default function layersInGeom (features, geom) {
  const latLngs = geom.getLatLngs()
  const bounds = geom.getBounds()

  const result = []
  features.forEach(feature => {
    const layer = feature.getLayer()
    try {
      contains(layer, latLngs, bounds)
    } catch (e) {
      if (e === resultFound) {
        result.push(feature)
      } else {
        throw e
      }
    }
  })

  return result
}
