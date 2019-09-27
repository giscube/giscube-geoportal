import Vue from 'vue'
import Vuex from 'vuex'

import auth from './module-auth'
import dataLayer from './module-data-layer'
import layout from './module-layout'
import map from './module-map'
import search from './module-search'
import root from './module-root'

Vue.use(Vuex)

export const modules = {
  auth,
  dataLayer,
  layout,
  map,
  search,
  root
}

export function registerModules (store) {
  for (let k in modules) {
    if (store.state[k] === undefined) {
      store.registerModule(k, modules[k])
    }
  }
}

export default function (/* { ssrContext } */) {
  return new Vuex.Store({
    modules: {
      auth,
      dataLayer,
      layout,
      map,
      search,
      root
    }
  })
}
