'use strict'

import { cloneClean } from '../lib/utils.js'

import Vue from 'vue'
import L from '../lib/leaflet'

/// Returns a generator that generates ids with the form <prefix><generated number><suffix>
export function* pkGenerator (prefix, suffix) {
  // Normalize arguments
  if (!prefix) {
    prefix = ''
  } else {
    prefix = prefix.toString()
  }
  if (!suffix) {
    suffix = ''
  } else {
    suffix = suffix.toString()
  }

  // Actual work
  let n = 0
  while (true) {
    yield prefix + n + suffix
    ++n
  }
}

/// The string representing 'multi'
const multi = 'multi'

/// Dictionary of the supported creation functions
const geomCreators = {
  point (map) {
    map.editTools.startMarker(null, {
      markerClass: L.CircleMarker
    })
  },
  marker (map) {
    this.point(map)
  },
  linestring (map) {
    map.editTools.startPolyline()
  },
  polygon (map) {
    map.editTools.startPolygon()
  }
}

/// Starts the creation (the user can draw it) of the geometry of the correct type on the map
export function createGeom (type, map) {
  // remove multi
  if (type.startsWith(multi)) {
    type = type.slice(multi.length)
  }

  // Get creator and invoke it (if exists)
  const create = geomCreators[type]
  if (create) {
    create.call(geomCreators, map) // sets this to geomCreators so the function can call each other
  } else {
    throw new Error('Unsupported geometry type ' + type)
  }
}

/// Does nothing
function doNothing () {}

/// Makes the geometry editable
function enableEdit (geom) {
  if (geom.enableEdit) {
    geom.enableEdit()
  } else {
    geom.dragging.enable()
  }
}

/// Makes the geometry not editable
function disableEdit (geom) {
  if (geom.disableEdit) {
    geom.disableEdit()
  } else {
    geom.dragging.disable()
  }
}

/// Returns the feature’s pk (or id) depending of what the trackBy is
function getPk () {
  return this[this.getTrackBy()]
}

/// Returns a list with all the geometries as Leaflet layers
function getGeoms () {
  const layer = this.getLayer()
  if (!layer) {
    return []
  }

  if (layer instanceof L.FeatureGroup) {
    return layer.getLayers()
  } else {
    return [layer]
  }
}

/// Iterates the geometry calling the callback for each
function eachGeom (callback) {
  const layer = this.getLayer()
  if (!layer) {
    return
  }

  if (layer instanceof L.FeatureGroup) {
    layer.eachLayer(l => callback(l))
  } else {
    callback(layer)
  }
}

/// Sets if the geometry is editable
function setEditing (value) {
  this.eachGeom(geom => {
    if (value) {
      enableEdit(geom)
    } else {
      disableEdit(geom)
    }
  })

  const self = this

  function _onEditHandler (event) {
    self.eachGeom(geom => {
      geom.off('editable:drawing:commit', _onEditHandler)
      geom.off('editable:dragend', _onEditHandler)
    })

    const editHandler = self.getEditHandler()
    if (editHandler) {
      editHandler.apply(this, arguments)
    }
  }
  value && this.eachGeom(geom => {
    geom.on('editable:drawing:commit', _onEditHandler)
    geom.on('editable:dragend', _onEditHandler)
  })
}

/// Makes a new copy of the GeoJSON feature based on the Leaflet information (it may had been edited)
function getEditResult (forceMulti) {
  const geom = this.getLayer().toGeoJSON().geometry
  if (forceMulti && !geom.type.startsWith('Multi')) {
    geom.type = 'Multi' + geom.type
    geom.coordinates = [geom.coordinates]
  }

  return geom
}

/// Makes a GeoJSON feature with the values given
function cleanClone (pk) {
  const result = {
    type: 'Feature',
    geometry: cloneClean(this.geometry),
    properties: cloneClean(this.properties, false)
  }

  if (pk === undefined) {
    pk = cloneClean(this.getPk())
  }

  result.id = pk

  return result
}

/// Adds all the functionality to the feature
export function addFeatureMixin (feature, selected, trackBy, onEdit) {
  Vue.set(feature, 'status', {})
  Vue.set(feature.status, 'selected', !!selected)
  Vue.set(feature.status, 'deleted', false)

  feature.getLayer = doNothing
  feature.getTrackBy = () => trackBy
  feature.getEditHandler = () => onEdit

  feature.getPk = getPk
  feature.getGeoms = getGeoms
  feature.eachGeom = eachGeom
  feature.setEditing = setEditing
  feature.getEditResult = getEditResult
  feature.cleanClone = cleanClone
}

/// Sets the correct state to layer and adds it to the feature
export function setupLayer (feature, layer, editing) {
  if (feature.hasOwnProperty('_getLayer')) {
    feature._getLayer().layer = layer
  } else {
    const _layer = { layer }
    feature._getLayer = () => _layer
    feature.getLayer = () => feature._getLayer().layer
  }

  if (editing) {
    Vue.nextTick(() => {
      feature.setEditing(true)
    })
  }
}

/// Allows the user to draw a new geometry and generates a new feature
export function newFeature (map, feature, trackBy, type) {
  return new Promise((resolve, reject) => {
    // Event handlers
    function commit (event) {
      removeEvents()
      addFeatureMixin(feature, false, trackBy, doNothing)
      setupLayer(feature, event.layer, true)

      feature.geometry = feature.getEditResult(type.startsWith('multi'))
      feature.status.new = true

      event.layer.remove()
      resolve(feature)
    }
    function cancel () {
      removeEvents()
      /* eslint prefer-promise-reject-errors: ["error", {"allowEmptyReject": true}] */
      reject()
    }

    // Events setting
    function removeEvents () {
      map.off('editable:drawing:commit', commit)
      map.off('editable:drawing:end', cancel)
    }
    map.on('editable:drawing:commit', commit)
    map.on('editable:drawing:end', cancel)

    createGeom(type, map)
  })
}
