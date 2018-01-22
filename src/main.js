// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import config from './config'
store.config = config

Vue.config.productionTip = false

require('../node_modules/bootstrap/less/bootstrap.less')
require('../node_modules/leaflet-sidebar/src/L.Control.Sidebar.css')
require('../node_modules/leaflet/dist/leaflet.css')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
