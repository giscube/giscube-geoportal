import Vue from 'vue'
import Vuex from 'vuex'

import auth from './module-auth'
import catalog from './module-catalog'
import catalogTree from './module-catalog-tree'
import dataLayer from './module-data-layer'
import layout from './module-layout'
import map from './module-map'
import search from './module-search'
import statistics from './module-statistics'
import root from './module-root'

Vue.use(Vuex)

const modules = {
  auth,
  catalog,
  catalogTree,
  dataLayer,
  layout,
  map,
  search,
  statistics,
  root
}

function registerModules (store) {
  for (let k in modules) {
    if (store.state[k] === undefined) {
      store.registerModule(k, modules[k])
    }
  }
}

function createStore (/* { ssrContext } */) {
  const store = new Vuex.Store({ modules })
  window.$store = store
  return store
}

createStore.modules = modules
createStore.registerModules = registerModules

export default createStore
