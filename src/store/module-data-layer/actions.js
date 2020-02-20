import clone from 'lodash/clone.js'

import databaseLayersApi from 'src/api/databaselayers.js'

import { CancelError } from 'src/lib/geomUtils'
import { throwUnhandledExceptions } from '../../lib/promiseUtils.js'
import { some } from '../../lib/itertools.js'
import { waitUntil } from '../../lib/utils.js'

export function invalidateState (context) {
  context.commit('setInitialState')
  return context.dispatch('refreshSources')
}

export function refreshSources (context) {
  const editsources = this.$config.editsources || []
  context.commit('clearLoadingSourceErrors')

  const requests = []
  editsources.forEach((source, index) => {
    const request = databaseLayersApi.getLayers(source, context.rootGetters['auth/config'])
      .then(response => {
        const s = clone(source)
        s.layers = response.data
          .map(layer => {
            layer.name = '' + layer.name
            if (!layer.title) {
              layer.title = layer.name.replace(/[-_]/g, ' ')
            } else {
              layer.title = '' + layer.title
            }
            return layer
          })
          .sort((a, b) => a.title.localeCompare(b.title))
        s.index = index
        return s
      })
      .catch(e => {
        console.error(e)
        context.commit('addLoadingSourceError', e)
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

export function toggleFilterPolygon (context) {
  if (context.state.filterPolygon) {
    context.dispatch('setFilterPolygon', null)
  } else {
    context.dispatch('map/draw', 'polygon', { root: true })
      .then(layer => {
        context.dispatch('setFilterPolygon', layer)
      })
      .catch(e => {
        if (e instanceof CancelError) {
          const layer = e.layer
          if (layer) {
            context.dispatch('setFilterPolygon', layer)
          }
        } else {
          this.$except(e)
        }
      })
  }
}

export function setFilterPolygon (context, layer) {
  if (layer) {
    layer.disableEdit()
  }
  context.commit('filterPolygon', layer)

  if (layer) {
    layer.setStyle({ opacity: 0.5 })
    layer.addTo(context.rootState.map.mapObject)
  }

  if (context.state.table) {
    context.state.table.remote.setPolygonFilter(layer)
  }
}

export function verifySourcesLoaded (context) {
  if (context.state.sources === null) {
    return context.dispatch('refreshSources')
  } else {
    return Promise.resolve(context.state.sources)
  }
}

function _updateWMS (context) {
  const table = context.state.table
  if (!table.updateWmsRequested) return
  table.updateWMS()
  const toRefresh = table.refLayers.filter(ref => ref.refresh).map(ref => ref.layer)
  const promise = waitUntil(() => table !== context.state.table || !some(toRefresh, layer => layer.isLoading()))
  context.commit('updateWms', promise)
}

async function queueJob (context, asyncJob) {
  context.state.asyncQueue.add(asyncJob)
  await context.state.updateWms
  return context.state.asyncQueue.run()
}

export async function asyncSave (context, asyncJob) {
  const first = !context.state.asyncQueue.running
  const queuePromise = queueJob(context, asyncJob)
  if (first && queuePromise) {
    await queuePromise
    await context.state.table.fillPage()
    _updateWMS(context)
  }
}

export const uploadPhoto = queueJob
