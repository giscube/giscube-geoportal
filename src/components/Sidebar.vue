<template>
  <q-drawer
    ref="drawer"
    v-model="sidebarVisible"
    side="left"
    content-class="left-drawer"
    elevated
    persistent
    no-swipe-close
    :width="width"
    :breakpoint="$store.state.layout.drawerBreakpoint"
    :overlay="$store.state.layout.drawersOverlay"
    :behavior="$store.state.layout.drawerBehavior"
  >
    <router-view @needs-wide='setWide' />
    <a @click.prevent="onToggleClick"
       class="sidebar-close"
       ><q-icon
        :name="sidebarVisible ? 'arrow_left' : 'arrow_right'"
        color="white"
        size="35px"
        /></a>
    <a v-if="sidebarVisible"
       @click.prevent="onToggleWidthClick"
       @mousedown="onToggleWidthMousedown"
       @touchstart="onToggleWidthMousedown"
       @touchend="onToggleWidthClick"
       class="sidebar-close sidebar-toggle-width"
       ><q-icon
        name="drag_indicator"
        color="white"
        size="35px"
        /></a>
  </q-drawer>
</template>

<script>
import { QDrawer, QIcon } from 'quasar'
import { mapState } from 'vuex'
import L from '../lib/leaflet'
const worldBounds = L.latLngBounds([[-90, -180], [90, 180]])

export default {
  components: {
    QDrawer,
    QIcon
  },
  data () {
    return {
      resizeDiff: 0,
      widthPercentage: this.$config.layout.sidebar.defaultWidthPercentage
    }
  },
  computed: {
    ...mapState({
      map: state => state.map.mapObject,
      layoutSize: state => state.layout.size
    }),
    width: {
      get: function () {
        return this.$store.state.layout.leftDrawerSize
      },
      set: function (newValue) {
        this.$store.dispatch('layout/setLeftDrawerSize', newValue)
      }
    },
    sidebarVisible: {
      get: function () {
        return this.$store.state.layout.sidebarVisible
      },
      set: function (newValue) {
        this.$store.dispatch('layout/setSidebarVisible', newValue)
      }
    }
  },
  watch: {
    'layoutSize': 'onResize',
    'map': 'mapChanged'
  },
  mounted () {
    document.documentElement.addEventListener('mousemove', this.onToggleWidthMousemove)
    document.documentElement.addEventListener('mouseup', this.onToggleWidthMouseup)
    document.documentElement.addEventListener('mouseleave', this.onToggleWidthMouseup)

    document.documentElement.addEventListener('touchmove', this.onToggleWidthMousemove, true)
    document.documentElement.addEventListener('touchend', this.onToggleWidthMouseup, true)
    document.documentElement.addEventListener('touchcancel', this.onToggleWidthMouseup, true)
  },
  beforeDestroy () {
    document.documentElement.removeEventListener('mousemove', this.onToggleWidthMousemove)
    document.documentElement.removeEventListener('mouseup', this.onToggleWidthMouseup)
    document.documentElement.removeEventListener('mouseleave', this.onToggleWidthMouseup)

    document.documentElement.removeEventListener('touchmove', this.onToggleWidthMousemove, true)
    document.documentElement.removeEventListener('touchend', this.onToggleWidthMouseup, true)
    document.documentElement.removeEventListener('touchcancel', this.onToggleWidthMouseup, true)
    document.documentElement.removeEventListener('touchstart', this.onToggleWidthMouseup, true)
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
      let width
      let widthPercentage = this.widthPercentage
      let rightMargin = 150
      if (this.layoutSize) {
        if (this.layoutSize.width < 600) {
          // sidebar breakpoint set at 600px
          widthPercentage = 95
          rightMargin = 25
        }
        width = this.layoutSize.width * widthPercentage / 100
        width = Math.min(this.layoutSize.width - rightMargin, width)
        width = Math.max(this.$config.layout.sidebar.minWidthPixels, width)
      } else {
        width = this.$config.layout.sidebar.minWidthPixels
      }
      this.width = width
    },
    onToggleClick () {
      this.$store.dispatch('layout/setSidebarVisible', !this.sidebarVisible)
    },
    onToggleWidthClick () {
      if (this.resized) {
        return
      }

      const changed = this.$config.layout.sidebar.steps.some(width => {
        if (this.widthPercentage < (width - 5)) {
          this.widthPercentage = width
          return true
        }
      })
      if (!changed) {
        this.widthPercentage = this.$config.layout.sidebar.defaultWidthPercentage
      }
      this.onResize()
    },
    onToggleWidthMousedown (event) {
      event.preventDefault()
      event.stopPropagation()
      this.resizing = true
      this.resized = false
      const mouseX = event.pageX || event.touches[0].pageX
      this.resizeDiff = mouseX - this.width
    },
    onToggleWidthMousemove (event) {
      if (!this.resizing) {
        return
      }
      event.stopPropagation()
      const mouseX = event.pageX === void 0 ? event.touches[0].pageX : event.pageX
      if (event.movementX !== void 0) {
        this.resized = this.resized || (Math.abs(event.movementX) > 1) || (Math.abs(event.movementY) > 1)
      } else {
        this.resized = true
      }
      const widthPercentage = (mouseX - this.resizeDiff) / this.layoutSize.width * 100
      this.widthPercentage = Math.min(90, Math.max(this.$config.layout.sidebar.defaultWidthPercentage, widthPercentage))
      this.onResize()
    },
    onToggleWidthMouseup (event) {
      if (this.resizing) {
        event.preventDefault()
        event.stopPropagation()
        this.resizing = false
        this.resizeDiff = 0
      }
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

.sidebar-toggle-width {
  left: calc(100% + 30px);
  border-radius: 4px;
  width: 30px;
}
.sidebar-toggle-width i {
  margin-left: -11px;
  margin-top: -7px;
}

// Same as breakpoint
@media (max-width: 600px) {
  .sidebar-toggle-width {
    display: none;
  }
}

.panel {
  a {
    text-decoration: none;
    color: #0078a8;
  }
}
.panel-content {
    padding: 15px 20px 15px 20px;
}
.panel-title {
  font-size: 1.5em;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  margin-bottom: 10px;
}
.panel-subtitle {
  font-size: 1.3em;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  margin-top: 15px;
  margin-bottom: 10px;
}
</style>
