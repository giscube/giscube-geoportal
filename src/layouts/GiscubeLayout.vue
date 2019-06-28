<template>
  <q-layout view="hHh lpR fFf"
    ref="layout"
    class="max-height"
    @resize="$store.commit('layout/size', $event)"
  >
    <!-- AppHeader -->
    <component :is="$config.layout.header"
        ref="header"
        :brand-logo="$config.branding.header.logo"
        :brand-text="$config.branding.header.text"
        @home='navHome'
        @sidebar-visibility-changed="onVisibilityChanged"
        @right="right = !right"
        />

    <Sidebar ref="sidebar"
      :map='map'
      :visible="$store.state.layout.sidebarVisible"
      :geoportalMap="$refs.map"
      @visibility-changed="onVisibilityChanged"
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
import { QLayout, QPageContainer } from 'quasar'
import L from '../lib/leaflet'
import AppFooter from 'components/AppFooter'
import GeoportalMap from 'components/GeoportalMap'
import Sidebar from 'components/Sidebar'

export default {
  name: 'GiscubeLayout',
  components: {
    AppFooter,
    GeoportalMap,
    QLayout,
    QPageContainer,
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
  mounted () {
    this.$nextTick(() => {
      const { width, height } = this.$refs.layout
      this.$store.commit('layout/size', { width, height })
      this.$store.dispatch('layout/setSidebarVisible', true)
    })
  },
  methods: {
    navHome () {
      const home = this.$config.home
      this.map.flyTo(new L.LatLng(home.center.lat, home.center.lng), home.zoom)
      this.onVisibilityChanged(true)
    },
    onMapReady (map) {
      this.map = map
    },
    onVisibilityChanged (visible) {
      this.$store.dispatch('layout/setSidebarVisible', visible)
    }
  }
}
</script>
