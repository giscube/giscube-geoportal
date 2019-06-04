import L from './leaflet.js'
import pointInPolygon from 'point-in-polygon'

function somePoint (layer, callback) {
  if (layer instanceof L.LayerGroup) {
    return layer.getLayers().some(l => somePoint(l, callback))
  } else if (layer instanceof L.Polygon) {
    return layer.getLatLngs()[0].some(callback)
  } else if (layer instanceof L.Polyline) {
    return layer.getLatLngs().some(callback)
  } else if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
    return callback(layer.getLatLng())
  } else if (layer instanceof L.LatLng) {
    return callback(layer)
  } else {
    console.warn('[lib/layersInGeom] Unsupported geom type')
    return false
  }
}

const toRaw = p => [p.lat, p.lng]
function contains (layer, geomLatlongs, bounds) {
  const rawLatLngs = geomLatlongs[0].map(toRaw)
  return somePoint(layer, p => {
    return bounds.contains(p) && pointInPolygon(toRaw(p), rawLatLngs)
  })
}

export function rowsInGeom (rows, geom) {
  const latLngs = geom.getLatLngs()
  const bounds = geom.getBounds()

  return rows.filter(row => contains(row.layer, latLngs, bounds))
}
