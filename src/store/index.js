import Vue from 'vue'
import Vuex from 'vuex'
import config from '../config'

// import example from './module-example'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      // example
    },
    state: {
      currentTool: null,
      map: null,
      searchQ: '',
      searching: false,
      count: 0,
      result: null,
      resultsLayer: null,
      autoselectResult: false,
      sidebarVisible: null
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
      setMap: (state, map) => {
        state.map = map
        console.log('MAP now set', state)
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

  return Store
}
