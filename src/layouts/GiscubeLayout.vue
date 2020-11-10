<template>
  <q-layout view="hHh lpR fFf"
    ref="layout"
    class="max-height"
    @resize="$store.commit('layout/size', $event)"
  >
    <!-- AppHeader -->
    <component :is="$config.layout.header"
      v-if="$store.state.layout.headerVisible"
      ref="header"
      :brand-logo="$config.branding.header.logo"
      :brand-text="$config.branding.header.text"
      :brand-link="$config.branding.header.link"
      @home='navHome'
      @sidebar-visibility-changed="onVisibilityChanged"
    />

    <Sidebar ref="sidebar"
      v-show="$store.state.layout.sidebarVisible"
      class="sidebar-left"
    />

    <q-page-container class="max-height">
      <loading-map-state />
      <!-- GeoportalMap -->
      <component :is="$config.layout.geoportalMap" />
    </q-page-container>

   <AppFooter v-if="false" ref="footer" />

  </q-layout>
</template>

<script>
import { QLayout, QPageContainer } from 'quasar'
import { mapState } from 'vuex'
import L from '../lib/leaflet'
import AppFooter from 'components/AppFooter'
import GeoportalMap from 'components/GeoportalMap'
import LoadingMapState from 'components/LoadingMapState'
import Sidebar from 'components/Sidebar'

export default {
  name: 'GiscubeLayout',
  components: {
    AppFooter,
    GeoportalMap,
    LoadingMapState,
    QLayout,
    QPageContainer,
    Sidebar
  },
  mounted () {
    this.$nextTick(() => {
      if (!this.$store.state.layout.isCustomView) {
        this.$store.dispatch('map/addDefaultLayers')
      }
      const { width, height } = this.$refs.layout
      this.$store.commit('layout/size', { width, height })
      this.$store.dispatch('layout/setSidebarOpen', true)
    })
  },
  computed: mapState({
    map: state => state.map.mapObject
  }),
  methods: {
    navHome () {
      const home = this.$config.home
      this.map.flyTo(new L.LatLng(home.center.lat, home.center.lng), home.zoom)
      this.onVisibilityChanged(true)
    },
    onVisibilityChanged (visible) {
      this.$store.dispatch('layout/setSidebarOpen', visible)
    }
  }
}
</script>
