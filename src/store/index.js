import Vue from 'vue'
import Vuex from 'vuex'

import auth from './module-auth'
import dataLayer from './module-data-layer'
import layout from './module-layout'
import map from './module-map'
import search from './module-search'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  return new Vuex.Store({
    modules: {
      auth,
      dataLayer,
      layout,
      map,
      search
    },
    state: {
      currentTool: null,
      query: null
    },
    mutations: {
      setCurrentTool: (state, value) => {
        state.currentTool = value
      },
      setQuery: (state, query) => {
        state.query = query
      }
    }
  })
}
