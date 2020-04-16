import L from './leaflet.js'
import pointInPolygon from 'point-in-polygon'
import { map, filter } from './itertools'
import { xor } from './utils'

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

  return rows.filter(row => row.layer && contains(row.layer, latLngs, bounds))
}

function containsWithHoles (point, multipolygon) {
  for (let polygon of multipolygon) {
    for (let i = 0; i < polygon.length; ++i) {
      const inRing = pointInPolygon(point, polygon[i])
      if (xor(i === 0, inRing)) {
        return false
      }
    }
  }
  return true
}

export function groupPointsByPolygons (points, polygons) {
  const result = new Map(
    map(
      filter(
        polygons,
        layer => layer instanceof L.Polygon
      ),
      layer => [layer, []]
    )
  )

  // Precomputed transformations
  const rawPolygons = new Map(
    map(
      result.keys(),
      polygon => {
        const p = polygon.getLatLngs()
        const multiPolygon = (p.length > 0 && L.LineUtil.isFlat(p[0])) ? [p] : p
        const rawPolygon = multiPolygon.map(polygon => polygon.map(ring => ring.map(toRaw)))
        return [polygon, rawPolygon]
      }
    )
  )

  for (let layer of points) {
    if (layer.getLatLng) {
      layer = layer.getLatLng()
    }
    if (!(layer instanceof L.LatLng)) {
      continue
    }
    const rawLayer = toRaw(layer)
    for (let polygon of result.keys()) {
      const rawPolygon = rawPolygons.get(polygon)
      if (containsWithHoles(rawLayer, rawPolygon)) {
        result.get(polygon).push(layer)
        break
      }
    }
  }

  return result
}
