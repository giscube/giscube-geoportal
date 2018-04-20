import Vue from 'vue'
import Router from 'vue-router'
import CatalogPanel from '@/components/CatalogPanel'
import HelloPanel from '@/components/HelloPanel'
import MeasurePanel from '@/components/MeasurePanel'
import GeoportalPanel from '@/components/GeoportalPanel'
import PlacePanel from '@/components/PlacePanel'
import SearchPanel from '@/components/SearchPanel'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/catalog/:q?', component: CatalogPanel, name: 'catalog' },
    {
      path: '/',
      name: 'HelloPanel',
      component: HelloPanel
    },
    { path: '/measure/', component: MeasurePanel, name: 'measure' },
    { path: '/place/:q*', component: PlacePanel, name: 'place' },
    { path: '/search/:q*', component: SearchPanel, name: 'search' },
    { path: '/geoportal/:q/', component: GeoportalPanel }
  ]
})
