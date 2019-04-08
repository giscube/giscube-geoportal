import Vue from 'vue'
import Vuex from 'vuex'
import config from '../config'

import auth from './module-auth'
import dataLayer from './module-data-layer'
import layout from './module-layout'
import map from './module-map'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      auth,
      dataLayer,
      layout,
      map
    },
    state: {
      currentTool: null,
      searchQ: '',
      searching: false,
      count: 0,
      result: null,
      resultsLayer: null,
      autoselectResult: false,
      sidebarVisible: null,
      query: null
    },
    mutations: {
      createResultsLayer: (state, value) => {
        state.resultsLayer = value
      },
      setAutoselectResult: (state, value) => {
        state.autoselectResult = value
      },
      setCurrentTool: (state, value) => {
        state.currentTool = value
      },
      setQuery: (state, query) => {
        state.query = query
      },
      setSidebarVisible: (state, value) => {
        state.sidebarVisible = value
      },
      selectResult: (state, result) => {
        state.result = result
        console.log('RESULT now set', result)
      },
      search: (state, q) => {
        state.searchQ = q
        state.searching = true
      },
      showResults: state => state.count--
    }
  })

  Store.config = config
  Store.dispatch('auth/loadState')

  return Store
}
