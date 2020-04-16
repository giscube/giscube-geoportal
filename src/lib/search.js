import axios from 'axios'
import Vue from 'vue'

import { toCoords } from 'components/CoordsPanel'

import except from './except'
import { noop } from './utils'

export default class Search {
  constructor (store, context) {
    this.$config = store.$config
    this.$context = context
    this.promises = null
    this.results = []
  }

  showLayer (result) {
    this.$context.dispatch('showResultLayer', result)
  }

  getSearches () {
    return this.$config.searches
  }

  parseResult ({ search, data }) {
    const results = search.parseData ? search.parseData(data) : data.results
    if (results === void 0 || results === null) {
      except('Response without results', { hide: true })
      return
    }

    if (search.is_geojson) {
      results.forEach(result => this.showLayer(result))
    }
    results.forEach(result => {
      result.origin = search
    })

    return results
  }

  setCoordsSearch (q) {
    if (toCoords(q)) {
      this.promises.push(Promise.resolve({
        origin: 'coordinates',
        epsg: '4326',
        coords: q
      }))
    }
  }

  setSearches (q) {
    this.getSearches().map(search => {
      const config = {
        params: { q }
      }
      if (search.auth) {
        Object.assign(config, this.$context.rootGetters['auth/config'])
      }

      this.promises.push(new Promise((resolve, reject) => {
        axios.get(search.url, config)
          .then(response => {
            resolve(this.parseResult({ search, data: response.data }))
          })
          .catch(reject)
      }))
    })
  }

  setAllSearches (q) {
    this.setCoordsSearch(q)
    this.setSearches(q)
  }

  search (q) {
    this.promises = []

    this.setAllSearches(q)

    this.results = Vue.observable(this.promises.map(() => []))

    this.promises.forEach((promise, index) => {
      promise
        .then(result => {
          this.results[index] = result
        })
        .catch(noop) // Will be propegated to the search. Not our reponsibility
    })

    const search = Promise.all(this.promises).then(_ => this.results)
    // Add reference to the temporary results
    search.results = this.results

    return search
  }

  showResultLayers () {
    for (let result of this.results.flat()) {
      if (result.layer) {
        this.showLayer(result)
      }
    }
  }
}
