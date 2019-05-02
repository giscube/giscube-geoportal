<template>
  <q-layout view="hHh lpR fFf"
    ref="layout"
    class="max-height"
    :class="appClasses"
    @resize="$store.commit('layout/size', $event)"
  >
    <!-- AppHeader -->
    <component :is="$config.layout.header"
        v-if="!printPreview"
        ref="header"
        :brand-logo="$config.branding.header.logo"
        :brand-text="$config.branding.header.text"
        @home='navHome'
        @print="print"
        @sidebar-visibility-changed="onVisibilityChanged"
        @right="right = !right"
        />

    <!-- PrintHeader -->
    <component :is="$config.layout.printHeader"
        v-if="printPreview"
        ref="printheader"
        :brand-logo="$config.branding.header.logo"
        :brand-text="$config.branding.header.text"
        :map="$refs.map"
        @done="printDone"
    />

    <Sidebar ref="sidebar"
      :map='map'
      :visible="$store.state.layout.sidebarVisible"
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
import L from '../lib/leaflet'
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
  mounted () {
    this.$nextTick(() => {
      const { width, height } = this.$refs.layout
      this.$store.commit('layout/size', { width, height })
      this.$store.commit('layout/setSidebarVisible', true)
    })
  },
  methods: {
    navHome () {
      let home = this.$store.config.home
      this.map.flyTo(new L.LatLng(home.center.lat, home.center.lng), home.zoom)
      this.onVisibilityChanged(true)
    },
    onMapReady (map) {
      this.map = map
    },
    onSearchStart (q) {
      this.$store.commit('layout/setSidebarVisible', true)
      this.$router.push('/search/' + q + '/')
    },
    onVisibilityChanged (visible) {
      this.$store.commit('layout/setSidebarVisible', visible)
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
