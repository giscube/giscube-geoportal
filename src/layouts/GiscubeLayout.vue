<template>
  <q-layout view="hHh lpR fFf"
    class="max-height"
    :class="appClasses"
  >
    <!-- Fixed navbar -->
    <!-- AppHeader -->
    <component :is="$config.layout.header"
        v-if="!printPreview"
        ref="header"
        @home='navHome'
        @print="print"
        @sidebar-visibility-changed="onVisibilityChanged"
        @right="right = !right"
        />

    <!-- PrintHeader -->
    <component :is="$config.layout.printHeader"
        v-if="printPreview"
        ref="printheader"
        :map="$refs.map"
        @done="printDone"
    />

    <q-drawer v-model="right" side="right" elevated>
    </q-drawer>

    <Sidebar ref="sidebar" :map='map' :visible="$store.state.sidebarVisible"
             :geoportalMap="$refs.map"
             @visibility-changed="onVisibilityChanged"
             @search-start="onSearchStart"
             class="sidebar-left"
    />

    <q-page-container class="max-height">
      <!-- GeoportalMap -->
      <component :is="$config.layout.geoportalMap"
        ref="map" @map-ready="onMapReady"
      />
    </q-page-container>

   <AppFooter v-if="false" ref="footer" />

  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
import L from 'leaflet'
import AppFooter from 'components/AppFooter'
import GeoportalMap from 'components/GeoportalMap'
import PrintHeader from 'components/PrintHeader'
import Sidebar from 'components/Sidebar'

export default {
  name: 'GiscubeLayout',
  components: {
    AppFooter,
    GeoportalMap,
    PrintHeader,
    Sidebar
  },
  data () {
    return {
      appClasses: {
        printpreview: false
      },
      leftDrawerOpen: this.$q.platform.is.desktop,
      map: null,
      printPreview: false,
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
    },
    print () {
      this.printPreview = true
      this.appClasses.printpreview = true
    },
    printDone () {
      this.printPreview = false
      this.appClasses.printpreview = false
    }
  }
}
</script>

<style lang="scss">
.print {
  display: none;
}
</style>
