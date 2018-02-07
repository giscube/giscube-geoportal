<template>
  <div id="app">
    <!-- Fixed navbar -->
    <AppHeader ref="header" brand="GISCube Geoportal"
      @search-start="onSearchStart"/>

    <!-- Begin page content -->
    <GeoportalMap @map-ready="onMapReady" />

    <AppFooter ref="footer" />

    <Sidebar ref="sidebar" :map='map' :visible="$store.state.sidebarVisible"
             @visibility-changed="onVisibilityChanged" />
  </div>
</template>

<script>
import L from 'leaflet'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import GeoportalMap from '@/components/GeoportalMap'
import Sidebar from '@/components/Sidebar'
require('../node_modules/leaflet-sidebar/src/L.Control.Sidebar.js')

// FIX leaflet's default icon path problems with webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  name: 'app',
  components: {
    AppHeader,
    AppFooter,
    GeoportalMap,
    Sidebar
  },
  data () {
    return {
      map: null,
      counter: 0
    }
  },
  mounted () {
    this.$nextTick(() => this.$refs.header.$refs.search_input.focus())
  },
  methods: {
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

<style lang="scss">
/* Wrapper for page content to push down footer */
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100%;
  height: 100%;
  /* Negative indent footer by its height */
  margin: 0 auto -35px 0;
  /* Pad bottom by footer height */
  padding: 0 0 35px 0;
}

#app > .center-container {
  padding: 50px 0 0 0;
  margin:0;
}

.center-container {
  height:100%;
}

.center-row {
  height:100%;
  background-size:cover;
}


label {
    font-weight: normal !important;
}

.list-group-item { padding: 5px 7px }
.list-group-header { padding: 0; margin: 0 }
.results-header { background-color: #ddd; font-weight: bold }
.results-children { margin: 0 0 5px 10px }
.results-children .list-group-item { background-color: #eeeef4 }
</style>
