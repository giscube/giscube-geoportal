<template>
  <q-layout view="hHh lpR fFf">
    <!-- Fixed navbar -->
    <AppHeader ref="header" @home='navHome'
        @sidebar-visibility-changed="onVisibilityChanged"
        @right="right = !right"
        />

    <q-drawer v-model="right" side="right" elevated>
    </q-drawer>

    <Sidebar ref="sidebar" :map='map' :visible="$store.state.sidebarVisible"
             :geoportalMap="$refs.map"
             @visibility-changed="onVisibilityChanged"
             @search-start="onSearchStart" />

    <q-page-container>
      <!-- Begin page content -->
      <GeoportalMap ref="map" @map-ready="onMapReady" />

   </q-page-container>

   <AppFooter v-if="false" ref="footer" />

  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
import L from 'leaflet'
import AppFooter from 'components/AppFooter'
import AppHeader from 'components/AppHeader'
import GeoportalMap from 'components/GeoportalMap'
import Sidebar from 'components/Sidebar'

export default {
  name: 'MyLayout',
  components: {
    AppFooter,
    AppHeader,
    GeoportalMap,
    Sidebar
  },
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      map: null,
      right: false,
      left: true,
      width: 300
    }
  },
  methods: {
    openURL,
    navHome () {
      let home = this.$store.config.home
      this.map.flyTo(new L.LatLng(home.center.lat, home.center.lng), home.zoom)
      this.onVisibilityChanged(true)
    },
    onMapReady (map) {
      this.map = map
    },
    onSearchStart (q) {
      this.$store.commit('setSidebarVisible', true)
      this.$router.push('/search/' + q + '/')
    },
    onVisibilityChanged (visible) {
      this.$store.commit('setSidebarVisible', visible)
    }
  }
}
</script>

<style>
</style>
