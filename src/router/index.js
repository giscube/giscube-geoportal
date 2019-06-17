import Vue from 'vue'
import Router from 'vue-router'
import ShareQuery from 'src/lib/shareQuery'
import CatalogPanel from 'components/CatalogPanel'
import ContactPanel from 'components/ContactPanel'
import CoordsPanel from 'components/CoordsPanel'
import HelpPanel from 'components/HelpPanel'
import HomePanel from 'components/HomePanel'
import AuthPanel from 'components/AuthPanel'
import DrawPanel from 'components/DrawPanel'
import PlacePanel from 'components/PlacePanel'
import SearchPanel from 'components/SearchPanel'
import SharePanel from 'components/SharePanel'
import StreetViewPanel from 'components/StreetViewPanel'
import DataPanel from 'components/data-layer/DataPanel'

Vue.use(Router)

const routes = [
  {
    path: '/',
    component: require('layouts/GiscubeLayout.vue').default,
    children: [
      { path: 'auth/', name: 'auth', component: AuthPanel },
      { path: 'catalog/:q?', component: CatalogPanel, name: 'catalog' },
      { path: 'contact/', component: ContactPanel, name: 'contact' },
      { path: 'coords/:epsg/:coords', component: CoordsPanel, name: 'coords' },
      { path: 'data/:sourceName?/:layerName?/', component: DataPanel, name: 'data' },
      { path: 'geoportal/:q/', redirect: { name: 'place' } },
      { path: 'help/', component: HelpPanel, name: 'help' },
      { path: 'home/', component: HomePanel, name: 'home' },
      { path: 'draw/', component: DrawPanel, name: 'draw' },
      { path: 'place/:q*', component: PlacePanel, name: 'place' },
      { path: 'search/:q*', component: SearchPanel, name: 'search' },
      { path: 'share', component: SharePanel, name: 'share' },
      { path: 'streetview/:q?', component: StreetViewPanel, name: 'streetview' },

      { path: ':q?', name: 'auth_params', component: AuthPanel },
      { path: '', redirect: { name: 'home' } }
    ]
  }
]

export default new Router({
  routes: routes,
  parseQuery: ShareQuery.fromQuery,
  stringifyQuery: ShareQuery.toQuery
})
