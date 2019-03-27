import L from './leaflet.js'

export function visiblePart (bbox, visibility) {
  /*
    Bounding box values must be of the same unit
    Visibility properties must be of the same unit

    Expects left + right <= width and top + bottom <= height
  */
  const [x1 = NaN, y1 = NaN, x2 = NaN, y2 = NaN] = [bbox.min.x, bbox.min.y, bbox.max.x, bbox.max.y]
  const { width = 1, height = 1, top = 0, right = 0, bottom = 0, left = 0 } = visibility

  const newX1 = x1 + (x2 - x1) * (left / width)
  const newY1 = y1 + (y2 - y1) * (top / height)
  const newX2 = x2 - (x2 - x1) * (right / width)
  const newY2 = y2 - (y2 - y1) * (bottom / height)

  const newWidth = width - right - left
  const newHeight = height - top - bottom

  return {
    bbox: L.bounds([[newX1, newY1], [newX2, newY2]]),
    visibility: {
      width: newWidth,
      height: newHeight
    }
  }
}

export function unprojectBounds (map, bounds) {
  const zoom = map.getZoom()
  return L.latLngBounds(map.unproject(bounds.min, zoom), map.unproject(bounds.max, zoom))
}

export function visibleMapPart (map, visibility) {
  const bbox = map.getPixelBounds()
  const result = visiblePart(bbox, visibility)
  return {
    bbox: unprojectBounds(map, result.bbox),
    visibility: result.visibility
  }
}
