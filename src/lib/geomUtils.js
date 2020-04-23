import axios from 'axios'
import Vue from 'vue'
import L from './leaflet.js'
import LeafletWMS from 'leaflet.wms'
import makeGeoJsonOptions from './makeGeoJsonOptions'
import proj4 from 'proj4'
import Table from './table'
import { cloneClean } from './utils'

import FeaturePopup from 'components/FeaturePopup'
import FeaturePopupDialog from 'components/FeaturePopupDialog'

export class CancelError extends Error {
  constructor (layer) {
    super('Cancelled operation')
    this.name = 'CancelError'
    this.layer = layer
  }
}

export function eachLayer (layer, callback) {
  function _eachLayer (layer) {
    if (layer.eachLayer) {
      layer.eachLayer(_eachLayer)
    } else {
      callback(layer)
    }
  }
  _eachLayer(layer)
}

export function makeLayerSnapshot (layer) {
  if (layer.getLatLngs) {
    return cloneClean(layer.getLatLngs())
  } else if (layer.getLatLng) {
    return cloneClean(layer.getLatLng())
  } else if (layer.getLayers) {
    // For now don't support adding or removing elements
    return layer.getLayers().map(layer => [ layer, makeLayerSnapshot(layer) ])
  } else {
    console.warn('Unsupported layer type to take a snapshot from')
  }
}

export function applyLayerSnapshot (layer, snapshot) {
  if (layer.getLatLngs) {
    layer.setLatLngs(snapshot)
  } else if (layer.getLatLng) {
    layer.setLatLng(snapshot)
  } else if (layer.getLayers) {
    layer.clearLayers()
    for (let [l, c] of snapshot) {
      applyLayerSnapshot(l, c)
      layer.addLayer(l)
    }
  } else {
    console.warn('Unsupported layer type to apply a snapshot to')
  }
}

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

export function normalizeLatLngBounds (bounds) {
  const result = [[], []]

  const deltaLat = bounds.getSouth() - bounds.getNorth()
  if (deltaLat >= 180 || deltaLat <= -180) {
    result[0].push(-90)
    result[1].push(90)
  } else {
    result[0].push((bounds.getNorth() + 90) % 180 - 90)
    result[1].push((bounds.getSouth() + 90) % 180 - 90)
  }

  const deltaLong = bounds.getWest() - bounds.getEast()
  if (deltaLong >= 360 || deltaLong <= -360) {
    result[0].push(-180)
    result[1].push(180)
  } else {
    result[0].push((bounds.getWest() + 180) % 360 - 180)
    result[1].push((bounds.getEast() + 180) % 360 - 180)
  }

  return L.latLngBounds(result)
}

export function unprojectBounds (map, bounds) {
  const zoom = map.getZoom()
  const result = L.latLngBounds(map.unproject(bounds.min, zoom), map.unproject(bounds.max, zoom))
  return normalizeLatLngBounds(result)
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
  geojson: createExternalLayerGeoJSON,
  databaselayer: createExternalDataBaseLayer
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

function setTileLayerBoundary (layer, { boundary }) {
  if (!layer || !boundary) {
    return layer
  }
  if (!L.TileLayer.BoundaryCanvas) {
    console.warn('[Giscube Geoportal] Trying to add a boundary without the necessary package installed. Use npm i leaflet-boundary-canvas to install it.')
    return layer
  }
  return L.TileLayer.BoundaryCanvas.createFromLayer(layer, { boundary, trackAttribution: true })
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
  let wms
  if (options.singleTile) {
    wms = LeafletWMS.overlay(layerDescriptor.url, layerOptions)
  } else {
    wms = setTileLayerBoundary(L.tileLayer.wms(layerDescriptor.url, layerOptions), options)
  }

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
    layer: setTileLayerBoundary(tms, options)
  })
}

function createExternalLayerGeoJSON ({ layerDescriptor, title, options, map, popupComponent = FeaturePopup, dialogComponent = FeaturePopupDialog, headers, metaOptions = {} }) {
  const { root } = metaOptions
  return new Promise((resolve, reject) => {
    axios.get(layerDescriptor.url, { headers })
      .then(response => {
        response.data.metadata.styleRules = response.data.metadata.style_rules
        delete response.data.metadata.style_rules

        const options = makeGeoJsonOptions(response.data.metadata, {
          map,
          propsData: { title },
          popup: {
            component: popupComponent,
            dialog: dialogComponent
          },
          root
        })

        const geoJsonLayer = L.geoJson(response.data, options)
        const shapetype = response.data.metadata.style.shapetype
        const isCluster = shapetype === 'marker' || shapetype === 'circle' || shapetype === 'image'
        const clusterOptions = isCluster && response.data.metadata.design.cluster

        let layer
        if (clusterOptions) {
          layer = L.markerClusterGroup(clusterOptions)
          layer.addLayer(geoJsonLayer)
        } else {
          layer = geoJsonLayer
        }

        resolve({
          type: 'GeoJSON',
          layer
        })
      })
      .catch(reject)
  })
}

async function createExternalDataBaseLayer ({ layerDescriptor, metaOptions }) {
  const url = layerDescriptor.url.replace(/([^:])\/\//g, '$1/') // Cleaned URL (no double slashes)

  // Extract information from the url
  const [, sourceUrl, layerName] = url.match(/^(.+)layerserver\/databaselayers\/([^/]+)\/?$/)
  const source = {
    url: sourceUrl
  }
  const layer = {
    name: layerName
  }

  const { root } = metaOptions
  const table = new Table(source, layer, root)
  await table.fetchInfo()
  await table.update({ immediate: true })

  table.removeLayers()

  return {
    type: 'DataBaseLayer',
    layer: table.layer,
    table
  }
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

export function splitType (type) {
  const isMulti = type.startsWith(multi)
  const baseType = isMulti ? type.slice(multi.length) : type
  return { isMulti, baseType }
}

export function createLayer ({ map, type, config, keepDrawn = false }) {
  const { isMulti, baseType } = splitType(type)

  return new Promise((resolve, reject) => {
    function cancel (event) {
      if (event.layer) {
        event.layer.remove()
      }
      removeEvents()

      let layer
      switch (baseType) {
        case 'point':
          break
        case 'linestring':
          if (event.layer && event.layer.getLatLngs().length >= 2) {
            layer = event.layer
          }
          break
        case 'polygon':
          if (event.layer && event.layer.getLatLngs()[0].length >= 3) {
            layer = event.layer
          }
          break
      }
      reject(new CancelError(layer))
    }
    function commit (event) {
      removeEvents()
      let layer
      if (isMulti) {
        layer = L.featureGroup()
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

export function getBounds (layer) {
  return layer.getBounds ? layer.getBounds() : layer.getLatLng()
}

export function layersBounds (layers) {
  if (!layers || layers.length < 1) {
    return
  }

  let bounds = new L.LatLngBounds()

  layers.forEach(layer => {
    bounds.extend(getBounds(layer))
  })

  return bounds
}

const defaultFormat = ([x, y]) => `${Math.floor(x)}, ${Math.floor(y)}`
export function formatCoords ({ lat, lng }, epsg) {
  const format = epsg.format ? epsg.format : defaultFormat
  return format(proj4('EPSG:4326', epsg.code, [lng, lat]))
}

export function makeReactiveTooltip (Component, componentConfig = {}, tooltipConfig = {}) {
  const tooltip = L.tooltip({
    direction: 'center',
    permanent: true,
    opacity: 1,
    ...tooltipConfig
  })
  const TooltipComponent = Vue.extend(Component)
  const component = new TooltipComponent(componentConfig)
  tooltip.setContent(component.$mount().$el)
  return tooltip
}
