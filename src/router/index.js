import Vue from 'vue'
import Router from 'vue-router'
import CatalogPanel from 'components/CatalogPanel'
import ContactPanel from 'components/ContactPanel'
import HomePanel from 'components/HomePanel'
import MeasurePanel from 'components/MeasurePanel'
import GeoportalPanel from 'components/GeoportalPanel'
import PlacePanel from 'components/PlacePanel'
import SearchPanel from 'components/SearchPanel'
import StreetViewPanel from 'components/StreetViewPanel'
import DataPanel from 'components/data-layer/Panel'

Vue.use(Router)

const routes = [
  {
    path: '/',
    component: () => import('layouts/GiscubeLayout.vue'),
    children: [
      { path: '', redirect: { name: 'home' } },
      { path: 'home/', component: HomePanel, name: 'home' },
      { path: 'catalog/:q?', component: CatalogPanel, name: 'catalog' },
      { path: 'contact/', component: ContactPanel, name: 'contact' },
      { path: 'measure/', component: MeasurePanel, name: 'measure' },
      { path: 'place/:q*', component: PlacePanel, name: 'place' },
      { path: 'search/:q*', component: SearchPanel, name: 'search' },
      { path: 'geoportal/:q/', component: GeoportalPanel },
      { path: 'data/:sourceName?/:layerName?/', component: DataPanel, name: 'data' },
      { path: 'streetview/:q?', component: StreetViewPanel, name: 'streetview' }
    ]
  }
]

export default new Router({
  routes: routes
})
