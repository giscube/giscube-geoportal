<template>
  <q-drawer v-model="sidebarVisible" side="left" overlay elevated persistent
    :width="width" :breakpoint="600" content-class="left-drawer"
    >
    <router-view :map='map' @needs-wide='setWide'
      :geoportalMap="geoportalMap"
    />
    <a @click.prevent="onToggleClick"
       class="sidebar-close"
       ><q-icon
        :name="sidebarVisible ? 'arrow_left' : 'arrow_right'"
        color="white"
        size="35px"
        /></a>
  </q-drawer>
</template>

<script>
import { debounce } from 'quasar'
import L from 'leaflet'
const worldBounds = L.latLngBounds([[-90, -180], [90, 180]])

export default {
  props: ['map', 'visible', 'geoportalMap'],
  data () {
    return {
      width: 300
    }
  },
  computed: {
    mapSize () {
      return this.$store.state.layout.mapSize
    },
    sidebarVisible: {
      get: function () {
        return this.$store.state.sidebarVisible
      },
      set: function (newValue) {
        this.$store.commit('setSidebarVisible', newValue)
      }
    }
  },
  watch: {
    'mapSize': 'onResize',
    'map': 'mapChanged'
  },
  mounted () {
    this.$nextTick(() => {
      this.onResize()
      this.$store.commit('setSidebarVisible', true)
    })
  },
  methods: {
    getMapInfo () {
      var info = {
        // isVisible: whether the map is not fully covered
        // visibleBounds: visible bounds, null if fully covered
      }

      let mapBounds = this.map.getBounds()
      let west = mapBounds.getWest()
      let east = mapBounds.getEast()
      let sidebarCover = (east - west) * this.width / this.map._container.clientWidth

      info.isVisible = this.width !== this.map._container.clientWidth
      info.coveredLng = sidebarCover
      // mapBounds without the area covered by the sidebar
      info.visibleBounds = L.latLngBounds([
        [mapBounds.getSouthWest().lat, mapBounds.getSouthWest().lng + sidebarCover],
        [mapBounds.getNorthEast().lat, mapBounds.getNorthEast().lng]
      ])
      info.widthLng = east - west
      info.visibleWidthPx = this.map._container.clientWidth - this.width
      info.visibleHeightPx = this.map._container.clientHeight
      info.visibleWidthMeters = mapBounds.getNorthEast().distanceTo(mapBounds.getNorthWest())
      info.visibleHeightMeters = mapBounds.getSouthEast().distanceTo(mapBounds.getNorthEast())
      info.sidebarWidthPx = this.width
      info.isViewValid = worldBounds.contains(info.visibleBounds)

      return info
    },
    onResize () {
      debounce(() => {
        let width = (this.mapSize && this.mapSize.width / 3) || 300
        this.width = Math.max(300, Math.min(400, width))
      }, 300, true)()
    },
    onToggleClick () {
      this.$store.commit('setSidebarVisible', !this.sidebarVisible)
    },
    setWide (isWide) {
      let klass = this.sidebar._container.className
      if (isWide) {
        if (!klass.includes('wide')) {
          klass += ' wide'
        }
      } else {
        if (klass.includes('wide')) {
          klass = klass.replace('wide', '')
        }
      }
      this.sidebar._container.className = klass
    },
    mapChanged () {
      if (this.map === null) {
        return
      }

      // extend map functionality the hacky way
      if (!this.map.giscube) {
        this.map.giscube = {}
      }
      this.map.giscube.getMapInfo = this.getMapInfo
    }
  }
}
</script>

<style lang="scss">
aside.q-drawer--left {
  background-color: transparent;
}
.left-drawer {
  background-color: #eeeeeeeb;

}

.sidebar-close {
  z-index: 1800;
  // right: -20px;
  left: 100%;
  top: 8px;
  position: absolute;
  font-size: 25px;
  line-height: 1em;
  text-align: center;
  background: #3b99fc;
  cursor: pointer;
  font-size: .85em;
  padding: 13px 8px;
  border-radius: 0 4px 4px 0;
  width: 23px;
  height: 48px;
}
.sidebar-close i {
  margin-left: -14px;
  margin-top: -7px;
}
.sidebar-close:hover {
  background: #636363;
}
.q-drawer--mobile .sidebar-close {
  top: 59px;
}

.panel-content {
    padding: 0 20px 15px 20px;
    margin-top: 15px;
}
.panel-title {
  font-size: 1.5em;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  margin-bottom: 10px;
}
.panel-subtitle {
  font-size: 1.4em;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  margin-top: 20px;
  margin-bottom: 10px;
}
</style>
