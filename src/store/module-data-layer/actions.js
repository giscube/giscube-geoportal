import _ from 'lodash'
import Vue from 'vue'

import databaseLayersApi from '../../api/databaselayers.js'

import { newFeature } from '../../lib/feature.js'
import { MultiResult } from '../../lib/MultiResult.js'
import { throwUnhandledExceptions } from '../../lib/promiseUtils.js'
import { notifyError, notifyHttpError } from '../../lib/notifications.js'
import layersInGeom from '../../lib/layersInGeom.js'

export function refreshSources (context) {
  const editsources = Vue.prototype.$config.editsources || []

  const requests = []
  editsources.forEach((source, index) => {
    const request = databaseLayersApi.getLayers(source)
      .then(response => {
        const s = _.clone(source)
        s.layers = response.data
        s.index = index
        return s
      })
      .catch(error => {
        notifyHttpError(error)
        throw error
      })
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
          notifyError('Layer does not exist or source not configured')
          reject(new Error('Selected layer or source does not exist'))
        }
      })
      .catch(error => {
        notifyHttpError(error)
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

export function selectByPolygon (context) {
  const result = new Promise((resolve, reject) => {
    const map = context.rootState.map.mapObject

    const commit = event => {
      removeEvents()
      const toSelect = layersInGeom(context.state.geojson, event.layer)
      context.commit('select', toSelect)
      event.layer.remove()
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
  context.commit('featureProperties', { feature, properties })
}

export function editMultiple (context, { features, properties }) {
  features.forEach(feature => {
    const p = {}
    let edited = false
    context.state.layerConfig.layerInfo.fields.forEach(f => {
      const fieldName = f.name
      if (MultiResult.is(properties[fieldName])) {
        p[fieldName] = feature.properties[fieldName]
      } else {
        p[fieldName] = properties[fieldName]
        edited = true
      }
    })

    if (edited) {
      context.dispatch('editProperties', { feature, properties: p })
    }
  })
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
}

export function saveEdits (context) {
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
      if (feature.status.new) {
        added.push(feature.cleanClone(null))
      } else {
        updated.push(feature.cleanClone())
      }
    }
  })

  context.commit('removeFeaturesByIndex', localDeleted)

  const result = new Promise((resolve, reject) => {
    databaseLayersApi.edit(context.state.current, {
      ADD: added,
      UPDATE: updated,
      DELETE: deleted
    })
      .then(result => {
        context.commit('unselectFeatures', unselect)
        context.commit('editing', false)
        resolve(result)
      })
      .catch(error => {
        notifyHttpError(error, false)
        reject(error)
      })
  })
  return throwUnhandledExceptions(result)
}

export function drawGeometry (context) {
  const layerInfo = context.state.layerConfig.layerInfo
  const fields = layerInfo.fields.filter(field => field.name !== layerInfo.geom_field)

  const featureBase = {
    type: 'Feature',
    id: context.state.editStatus.newPkGenerator.next().value,
    properties: {}
  }
  for (let field of fields) {
    featureBase.properties[field.name] = null
  }

  const result = newFeature(context.rootState.map.mapObject, featureBase, 'id', layerInfo.geom_type)
  return throwUnhandledExceptions(result)
}

export function stopDrawing (context) {
  context.commit('map/stopDrawing')
}

export function addNewFeature (context, feature) {
  if (context.state.editStatus.editing) {
    feature.getEditHandler = () => () => context.dispatch('editGeometry', feature)
  }
  context.state.table.features.push(feature)
  Vue.set(context.state.editStatus.originals, feature.getPk(), null)
}
