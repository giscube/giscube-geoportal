import { createGeoJSONLayer } from 'src/lib/geomUtils'
import axios from 'axios'

/**
 * @babel/polyfill@^7.4.0 is supposed to include "flat", but that doesn't work of us -
 * presumably because transitive dependencies still include babel 6 and the
 * corresponding babel-polyfill package. So we include this "manual" polyfill for now.
 *
 * https://github.com/babel/babel/issues/9749
 */
function flat (arrays) {
  return [].concat.apply([], arrays)
}

export function invalidateState (context) {
  context.commit('setInitialState')
}

export function clearResultLayer (context) {
  if (context.state.resultsLayer && context.state.resultsLayer.clearLayers) {
    context.state.resultsLayer.clearLayers()
  }
}

export async function search (context, { query, forceRefresh = false, auto }) {
  if (auto !== void 0) {
    context.commit('auto', auto)
  }
  if (!forceRefresh && query === context.state.query) {
    const autoSelect = context.state.auto !== false && await context.dispatch('uniqueSelection')
    if (!autoSelect) {
      context.dispatch('ensureEngine')
      context.state.engine.showResultLayers()
    }
    return
  }

  context.commit('query', query)
  if (query) {
    context.commit('auto', auto !== false)
    context.dispatch('fetch')
  }
}

export function ensureEngine (context) {
  if (!context.state.engine) {
    const Engine = this.$config.searchEngine
    context.commit('engine', new Engine(this, context))
  }
}

export function fetch (context) {
  context.dispatch('clearResultLayer')
  context.dispatch('ensureEngine')

  const search = context.state.engine.search(context.state.query)
  context.commit('fetchingResults', search.results)

  search
    .then(results => {
      context.dispatch('finishResults', flat(results))
    })
    .catch(error => {
      context.commit('errorFetching', true)
      this.$except(error)
    })
}

export function searchGiscubeId (context, giscubeId) {
  context.dispatch('clearResultLayer')

  const url = this.$config.catalog.base + 'geoportal/giscube_id/' + giscubeId
  const headers = context.rootGetters['auth/headers']
  const conf = {
    headers
  }
  axios.get(url, conf).then(response => {
    const results = response.data.results
    context.commit('fetchingResults', results)
    context.dispatch('finishResults', flat(results))
  })
}

export function finishResults (context, results) {
  context.commit('finalResults', results)
  context.state.auto && context.dispatch('uniqueSelection')
}

export function uniqueSelection (context) {
  const finalResults = context.state.finalResults
  if (!finalResults || finalResults.length === 0) {
    return false
  }
  const isUniqueResult = finalResults.length === 1
  const isTitleMatch = finalResults[0].title === context.state.query
  if (isUniqueResult || isTitleMatch) {
    context.dispatch('select', { result: finalResults[0], replace: true })
    return true
  }
  return false
}

export function select (context, { result, replace = false }) {
  const router = this.$router
  context.commit('selectResult', result)
  const go = (replace ? router.replace : router.push).bind(router)

  if (result.origin === 'coordinates') {
    const params = {
      epsg: '4326',
      coords: result.coords
    }
    go({ name: 'coords', params })
  } else {
    const params = {
      q: result.title
    }
    go({ name: 'place', params })
  }
}

export function showResultLayer (context, result) {
  if (!result.layer) {
    result.layer = createGeoJSONLayer({ result, popupComponent: this.$config.tools.search.searchResultPopup })
  }
  context.state.resultsLayer.addLayer(result.layer)
}

export function clearResultsLayers (context) {
  if (context.state.resultsLayer) {
    context.state.resultsLayer.clearLayers()
  }
}

export async function optionSearch (context, { query }) {
  if (query) {
    context.dispatch('ensureEngine')

    const search = context.state.engine.search(query)

    search
      .then(results => {
        context.commit('optionResult', flat(results))
      })
      .catch(error => {
        context.commit('errorFetching', true)
        this.$except(error)
      })
  }
}
