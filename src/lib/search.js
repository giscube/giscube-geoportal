import axios from 'axios'
import Vue from 'vue'

import { toCoords } from 'components/CoordsPanel'

import except from './except'
import { noop } from './utils'

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

  parseICGCResult ({ search, data }) {
    let results = []

    data.features.forEach(element => {
      const subtitle = (
        element.properties.addendum && element.properties.addendum.tipus
      ) ? element.properties.addendum.tipus + ': ' : ''
      let result = {
        title: element.properties.etiqueta,
        subtitle: subtitle + element.properties.etiqueta,
        geojson: element,
        origin: {
          name: 'icgc'
        }
      }
      delete result.geojson.properties.addendum
      results.push(result)
    })

    return results
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

  setICGCSearch (q) {
    const search = this.$config.geocodificadorICGC
    if (search) {
      const config = {
        params: {
          text: q,
          layers: /\d/.test(q) ? 'address' : 'topo1,topo2',
          ...this.$config.geocodificadorICGC.params
        }
      }
      this.promises.push(new Promise((resolve, reject) => {
        axios.get(search.url, config)
          .then(response => {
            resolve(this.parseICGCResult({ search, data: response.data }))
          })
          .catch(reject)
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
    this.setICGCSearch(q)
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
    for (let result of flat(this.results)) {
      if (result.layer) {
        this.showLayer(result)
      }
    }
  }
}
