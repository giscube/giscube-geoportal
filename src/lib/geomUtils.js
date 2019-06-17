import axios from 'axios'
import Vue from 'vue'
import L from './leaflet.js'
import { CancelError } from './utils'
import makeGeoJsonOptions from './makeGeoJsonOptions'

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

export function createLayerFromConfig (config) {
  if (config.result.geojson) {
    return Promise.resolve({
      layer: createGeoJSONLayer(config),
      type: 'GeoJSON'
    })
  } else {
    return createExternalLayer(config)
  }
}

export function createGeoJSONLayer ({ result, popupComponent }) {
  const layer = L.GeoJSON.geometryToLayer(result.geojson)
  if (popupComponent) {
    const PopupContent = Vue.extend(popupComponent)
    const popup = new PopupContent({
      propsData: {
        feature: result
      }
    })
    popup.$on('delete', () => {
      layer.remove()
    })
    layer.bindPopup(popup.$mount().$el)
  }
  return layer
}

const createExternalLayerActions = {
  wms: createExternalLayerWMS,
  tms: createExternalLayerTMS,
  geojson: createExternalLayerGeoJSON
}

export function createExternalLayer (config) {
  const type = config.layerDescriptor.type
  if (type && typeof type === 'string') {
    const action = createExternalLayerActions[type.toLowerCase()]
    if (action) {
      return action(config)
    }
  }

  console.warn(`Trying to add layer of unknown type "${type}"`)
  return Promise.reject()
}

function createExternalLayerWMS ({ layerDescriptor, title, options }) {
  const defaultOptions = {
    layers: layerDescriptor.layers,
    format: 'image/png',
    transparent: true,
    maxZoom: 22
  }
  const allowedOptions = ['minZoom', 'maxZoom', 'layers', 'styles', 'format', 'transparent', 'format', 'version',
    'csr', 'uppercase', 'attribution']
  const layerOptions = applyExtraOptions(defaultOptions, options, allowedOptions)
  const wms = L.tileLayer.wms(layerDescriptor.url, layerOptions)

  return Promise.resolve({
    type: 'WMS',
    layer: wms
  })
}

function createExternalLayerTMS ({ layerDescriptor, title, options }) {
  const defaultOptions = {
    transparent: true,
    maxZoom: 22
  }
  const allowedOptions = ['minZoom', 'maxZoom', 'tms', 'attribution']
  const layerOptions = applyExtraOptions(defaultOptions, options, allowedOptions)
  const tms = L.tileLayer(layerDescriptor.url, layerOptions)
  return Promise.resolve({
    type: 'TMS',
    layer: tms
  })
}

function createExternalLayerGeoJSON ({ layerDescriptor, title, options, map, popupComponent }) {
  return new Promise((resolve, reject) => {
    axios.get(layerDescriptor.url)
      .then(response => {
        response.data.metadata.styleRules = response.data.metadata.style_rules
        delete response.data.metadata.style_rules

        const options = makeGeoJsonOptions(response.data.metadata, {
          map,
          propsData: { title },
          popup: { component: popupComponent }
        })

        resolve({
          type: 'GeoJSON',
          layer: L.geoJson(response.data, options)
        })
      })
      .catch(reject)
  })
}

const multi = 'multi'

const geomCreators = {
  point (editTools, config) {
    editTools.startMarker(void 0, config)
  },
  marker (editTools, config) {
    this.point(editTools, config)
  },
  linestring (editTools, config) {
    editTools.startPolyline(void 0, config)
  },
  polygon (editTools, config) {
    editTools.startPolygon(void 0, config)
  }
}

export function createLayer ({ map, type, config, keepDrawn = false }) {
  const isMulti = type.startsWith(multi)
  const baseType = isMulti ? type.slice(multi.length) : type

  return new Promise((resolve, reject) => {
    function cancel () {
      removeEvents()
      reject(new CancelError())
    }
    function commit (event) {
      removeEvents()
      let layer
      if (isMulti) {
        layer = L.layerGroup()
        layer.addLayer(event.layer)
      } else {
        layer = event.layer
      }
      if (!keepDrawn) {
        layer.remove()
      }
      resolve(layer)
    }

    // Events setting
    function removeEvents () {
      map.off('editable:drawing:commit', commit)
      map.off('editable:drawing:end', cancel)
    }
    map.on('editable:drawing:commit', commit)
    map.on('editable:drawing:end', cancel)

    const create = geomCreators[baseType]
    if (create) {
      create.call(geomCreators, map.editTools, config) // sets this to geomCreators so the function can call each other
    } else {
      reject(new Error('Unsupported geometry type ' + type))
    }
  })
}

export function flipLatLng (coords) {
  if (coords.length > 0 && Array.isArray(coords[0])) {
    return coords.map(flipLatLng)
  } else if (coords.length >= 2) {
    const n = [...coords]
    n.reverse()
    return n
  } else {
    return coords
  }
}
