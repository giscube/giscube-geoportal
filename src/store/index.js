import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
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
      console.log('state.resultsLayer', state.resultsLayer)
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
    search: (state) => (q) => {
      state.searchQ = q
      state.searching = true
    },
    showResults: state => state.count--
  },
  strict: false
})
