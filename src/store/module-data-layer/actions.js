import clone from 'lodash/clone.js'
import Vue from 'vue'

import databaseLayersApi from '../../api/databaselayers.js'

import except from '../../lib/except.js'
import { throwUnhandledExceptions } from '../../lib/promiseUtils.js'

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
      .catch(except)
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

export function uploadPhoto (context, asyncPhoto) {
  context.state.uploadQueue.add(asyncPhoto).run()
}
