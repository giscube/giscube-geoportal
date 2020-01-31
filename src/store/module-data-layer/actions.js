import clone from 'lodash/clone.js'

import databaseLayersApi from '../../api/databaselayers.js'

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
  table.updateWmsRequested = false
  table.updateWMS()
  const toRefresh = table.refLayers.filter(ref => ref.refresh).map(ref => ref.layer)
  window.toRefresh = toRefresh
  const promise = waitUntil(() => table !== context.state.table || !some(toRefresh, layer => layer.isLoading()))
  context.commit('updateWms', promise)
}

function queueJob (context, asyncJob) {
  context.state.asyncQueue.add(asyncJob)
  context.state.updateWms.then(() => {
    const promise = context.state.asyncQueue.run()
    if (promise) {
      promise.then(() => _updateWMS(context))
    }
  })
}
// Both use the same queue so it uses the same code to add the jobs
export const uploadPhoto = queueJob
export const asyncSave = queueJob
