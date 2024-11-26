import Router from 'vue-router'
// import CatalogPanel from 'components/CatalogPanel'
import CatalogTreePanel from 'components/CatalogTreePanel'
import ContactPanel from 'components/ContactPanel'
import CoordsPanel from 'components/CoordsPanel'
import HelpPanel from 'components/HelpPanel'
import HomePanel from 'components/HomePanel'
import AuthPanel from 'components/AuthPanel'
import DrawPanel from 'components/DrawPanel'
import IncidencePanel from 'components/IncidencePanel'
import PlacePanelStrategy from 'components/PlacePanelStrategy'
import SearchPanel from 'components/SearchPanel'
import SharePanel from 'components/SharePanel'
import StreetViewPanel from 'components/StreetViewPanel'
import DataPanel from 'components/data-layer/DataPanel'
import CriminalPanel from 'components/CriminalPanel'

export default function ({ Vue, store }) {
  Vue.use(Router)

  const routes = [
    {
      path: '/',
      component: require('layouts/GiscubeLayout.vue').default,
      children: [
        { path: 'auth/', name: 'auth', component: AuthPanel },
        { path: 'catalog/:q?', component: CatalogTreePanel, name: 'catalog' },
        { path: 'contact/', component: ContactPanel, name: 'contact' },
        { path: 'coords/:epsg/:coords', component: CoordsPanel, name: 'coords' },
        { path: 'data/:sourceName?/:layerName?/', component: DataPanel, name: 'data' },
        { path: 'geoportal/:q/', redirect: { name: 'place' } },
        { path: 'help/', component: HelpPanel, name: 'help' },
        { path: 'home/', component: HomePanel, name: 'home' },
        { path: 'draw/', component: DrawPanel, name: 'draw' },
        { path: 'incidence/', component: IncidencePanel, name: 'incidence' },
        { path: 'place/:q*', component: PlacePanelStrategy, name: 'place' },
        { path: 'search/:q*', component: SearchPanel, name: 'search', query: 'giscube_id' },
        { path: 'share', component: SharePanel, name: 'share' },
        { path: 'streetview/:q?', component: StreetViewPanel, name: 'streetview' },
        { path: 'criminal/', component: CriminalPanel, name: 'criminal' },

        { path: ':q?', name: 'auth_params', component: AuthPanel },
        { path: '', redirect: { name: 'home' } }
      ]
    }
  ]
  const router = new Router({
    routes: routes
  })

  router.beforeEach((to, from, next) => {
    store.dispatch('layout/applyDialogs', { to, from, next })
  })

  return router
}
