import clone from 'lodash/clone.js'
import defaults from 'lodash/defaults.js'
import Vue from 'vue'

import databaseLayersApi from '../../api/databaselayers.js'

import except from '../../lib/except.js'
import { cloneClean, isCleanEqual } from '../../lib/utils.js'
import { newFeature } from '../../lib/feature.js'
import MultiResult from '../../lib/MultiResult.js'
import { throwUnhandledExceptions } from '../../lib/promiseUtils.js'
import layersInGeom from '../../lib/layersInGeom.js'

export function refreshSources (context) {
  const editsources = Vue.prototype.$config.editsources || []

  const requests = []
  editsources.forEach((source, index) => {
    const request = databaseLayersApi.getLayers(source, context.rootGetters['auth/config'])
      .then(response => {
        const s = clone(source)
        s.layers = response.data
        s.index = index
        return s
      })
      .catch(except.http)
    requests.push(request)
  })
  const result = new Promise((resolve, reject) => {
    Promise.all(requests)
      .then(results => {
        const sources = results
          .filter(result => result !== undefined)
          .sort((a, b) => a.index < b.index)

        context.commit('sources', sources)
        resolve(sources)
      })
  })
  return throwUnhandledExceptions(result)
}

export function verifySourcesLoaded (context) {
  if (context.state.sources === null) {
    return context.dispatch('refreshSources')
  } else {
    return Promise.resolve(context.state.sources)
  }
}

export function selectLayer (context, { sourceName, layerName }) {
  const result = new Promise((resolve, reject) => {
    context.dispatch('verifySourcesLoaded')
      .then(sources => {
        const source = sources.find(source => source.name === sourceName)
        const layer = source && source.layers.find(layer => layer.name === layerName)
        if (layer) {
          context.commit('current', { source, layer })
          resolve({ source, layer })
        } else {
          except('Layer does not exist or source not configured')
          reject(new Error('Selected layer or source does not exist'))
        }
      })
      .catch(error => {
        except.http(error)
        reject(error)
      })
  })

  return throwUnhandledExceptions(result)
}

export function setFeatures (context, features) {
  context.commit('features', features)
  context.commit('setGeojson')
}

export function refreshGeojson (context) {
  context.commit('setGeojson', false)
  Vue.nextTick(() => {
    context.commit('setGeojson')
  })
}

export function filterByPolygon (context) {
  const result = new Promise((resolve, reject) => {
    const map = context.rootState.map.mapObject

    const commit = event => {
      removeEvents()
      const coord2str = c => `${c.lng} ${c.lat}`
      const coords = event.layer.getLatLngs()[0]
      const strCoords = coords.map(coord2str).join(', ') + ', ' + coord2str(coords[0])
      const result = `POLYGON((${strCoords}))`

      event.layer.remove()
      removeEvents()
      resolve(result)
    }
    const cancel = event => {
      if (event.layer) {
        event.layer.remove()
      }
      removeEvents()
      reject()
    }

    const removeEvents = () => {
      map.off('editable:drawing:commit', commit)
      map.off('editable:drawing:end', cancel)
    }
    map.on('editable:drawing:commit', commit)
    map.on('editable:drawing:end', cancel)

    map.editTools.startPolygon()
  })
  return throwUnhandledExceptions(result)
}

export function selectByPolygon (context) {
  const result = new Promise((resolve, reject) => {
    const map = context.rootState.map.mapObject

    const commit = event => {
      removeEvents()
      const toSelect = layersInGeom(context.state.geojson, event.layer)
      context.commit('select', toSelect)
      event.layer.remove()
      removeEvents()
      resolve(toSelect)
    }
    const cancel = event => {
      if (event.layer) {
        event.layer.remove()
      }
      removeEvents()
      reject()
    }

    const removeEvents = () => {
      map.off('editable:drawing:commit', commit)
      map.off('editable:drawing:end', cancel)
    }
    map.on('editable:drawing:commit', commit)
    map.on('editable:drawing:end', cancel)

    map.editTools.startPolygon()
  })
  return throwUnhandledExceptions(result)
}

export function startEditing (context) {
  if (context.state.editStatus.editing) {
    return
  }

  context.commit('resetEditStatus')
  context.commit('editing', true)
}

export function editProperties (context, { feature, properties }) {
  context.commit('featureHistory', feature)
  context.commit('featureProperties', { feature, properties: defaults(properties, feature) })
}

export function editMultiple (context, { features, properties }) {
  const fields = context.state.layerConfig.fields

  features.forEach(feature => {
    const p = {}
    let edited = false
    fields.forEach(f => {
      const fieldName = f.name
      if (MultiResult.is(properties[fieldName])) {
        // keep same value
        p[fieldName] = f.getValue({ feature })
      } else {
        p[fieldName] = f.cloneValue({ properties })
        edited = true
      }
    })

    if (edited) {
      context.dispatch('editProperties', { feature, properties: defaults(p, feature) })
    }
  })

  // cleanup the values for the AsyncValue to have the correct reference counter
  fields.forEach(f => f.setValue({ properties, value: null }))
}

export function editGeometry (context, feature) {
  context.commit('featureHistory', feature)
  feature.geometry = feature.getEditResult()
}

export function cancelEdits (context) {
  if (!context.state.editStatus.editing) {
    return
  }

  context.commit('revertAllFeatures')
  context.commit('editing', false)
  context.commit('cleanup')
}

export function saveEdits (context) {
  if (context.state.uploadQueue.running) {
    throw new Error('Trying to save while uploading')
  }

  const geojson = context.state.geojson
  const originals = context.state.editStatus.originals

  const unselect = []

  const added = []
  const updated = []
  const deleted = []

  const localDeleted = []

  geojson.forEach((feature, index) => {
    const pk = feature.getPk()
    if (feature.status.deleted) {
      if (feature.status.new) {
        localDeleted.push(index)
      } else {
        deleted.push(feature.id)
      }

      if (feature.status.selected) {
        unselect.push(feature.id)
      }
    } else if (pk in originals) {
      const fields = context.state.layerConfig.fields
      if (feature.status.new) {
        const result = {}

        result.geometry = feature.geometry

        result.properties = {}
        fields.forEach(field => {
          result.properties[field.name] = field.repr(feature)
        })

        added.push(result)
      } else {
        const original = originals[pk]
        const result = {}

        result.id = pk

        if (!isCleanEqual(original.geometry, feature.geometry)) {
          result.geometry = cloneClean(feature.geometry)
        }

        result.properties = {}
        fields.forEach(field => {
          if (!field.equals({ feature: original }, { feature })) {
            result.properties[field.name] = field.repr(feature)
          }
        })

        updated.push(result)
      }
    }
  })

  context.commit('removeFeaturesByIndex', localDeleted)

  if (added.length === 0 && updated.length === 0 && deleted.length === 0) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    databaseLayersApi.edit(
      context.state.current,
      {
        ADD: added,
        UPDATE: updated,
        DELETE: deleted
      },
      context.rootGetters['auth/config']
    )
      .then(result => {
        context.commit('unselectFeatures', unselect)
        context.commit('editing', false)
        context.commit('cleanup')
        resolve(result)
      })
      .catch(error => {
        except.http(error, false)
        reject(error)
      })
  })
}

export function drawGeometry (context) {
  const layerInfo = context.state.layerConfig.layerInfo

  const featureBase = {
    type: 'Feature',
    id: context.state.editStatus.newPkGenerator.next().value,
    properties: {}
  }

  const result = newFeature(context.rootState.map.mapObject, featureBase, 'id', layerInfo.geom_type)
  return throwUnhandledExceptions(result)
}

export function stopDrawing (context) {
  context.dispatch('map/stopDrawing')
}

export function addNewFeature (context, feature) {
  if (context.state.editStatus.editing) {
    feature.getEditHandler = () => () => context.dispatch('editGeometry', feature)
  }
  context.state.table.features.push(feature)
  Vue.set(context.state.editStatus.originals, feature.getPk(), null)
}

export function uploadPhoto (context, asyncPhoto) {
  context.state.uploadQueue.add(asyncPhoto).run()
}
