import axios from 'axios'
import Vue from 'vue'
import { createGeoJSONLayer } from 'src/lib/geomUtils'

import SearchResultPopup from 'components/SearchResultPopup'
import { toCoords } from 'components/CoordsPanel'

export function clearResultLayer (context) {
  context.state.resultsLayer.clearLayers()
}

export function search (context, { query, forceRefresh = false }) {
  if (!forceRefresh && query === context.state.query) {
    context.dispatch('uniqueSelection')
    return
  }

  context.commit('query', query)
  if (query) {
    context.dispatch('fetch')
  }
}

export function fetch (context) {
  const except = Vue.prototype.$except
  context.commit('fetchingResults', [])

  const q = context.state.query

  // Add coords result
  if (toCoords(q)) {
    context.state.fetchingResults.push({
      origin: 'coordinates',
      epsg: '4326',
      coords: q
    })
  }

  context.dispatch('clearResultLayer')

  // Generate a list of "get" promises
  const promises = Vue.prototype.$config.searches.map(search => {
    const params = { q }
    return axios.get(search.url, { params })
      .then(response => {
        context.dispatch('parseResults', { search, data: response.data })
      })
      .catch(error => {
        context.commit('errorFetching', true)
        except(error)
      })
  })

  // When all fetched and parsed
  Promise.all(promises)
    .then(() => context.dispatch('finishResults'))
}

export function parseResults (context, { search, data }) {
  const except = Vue.prototype.$except

  const results = search.parseData ? search.parseData(data) : data.results
  if (results === void 0 || results === null) {
    except('Response without results', { hide: true })
    return
  }

  if (search.is_geojson) {
    results.forEach(result => context.dispatch('showResultLayer', result))
  }
  results.forEach(result => {
    result.origin = search
  })

  const fr = context.state.fetchingResults
  fr.push.apply(fr, results)
}

export function finishResults (context) {
  context.commit('finalResults', context.state.fetchingResults)
  context.dispatch('uniqueSelection')
}

export function uniqueSelection (context) {
  const finalResults = context.state.finalResults
  if (finalResults && finalResults.length === 1) {
    context.dispatch('select', { result: finalResults[0], replace: true })
  }
}

export function select (context, { result, replace = false }) {
  const router = context.rootState.router
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
    result.layer = createGeoJSONLayer({ result, popupComponent: SearchResultPopup })
  }
  context.state.resultsLayer.addLayer(result.layer)
}

export function clearResultsLayers (context) {
  if (context.state.resultsLayer) {
    context.state.resultsLayer.clearLayers()
  }
}
