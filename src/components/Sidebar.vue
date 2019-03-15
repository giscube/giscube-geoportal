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
import { debounce } from 'quasar'
import L from '../lib/leaflet'
const worldBounds = L.latLngBounds([[-90, -180], [90, 180]])

export default {
  props: ['map', 'visible', 'geoportalMap'],
  data () {
    return {
      resizeDiff: 0,
      width: 300,
      widthPercentage: 30
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
    document.documentElement.addEventListener('mousemove', this.onToggleWidthMousemove)
    document.documentElement.addEventListener('mouseup', this.onToggleWidthMouseup)
    document.documentElement.addEventListener('mouseleave', this.onToggleWidthMouseup)

    document.documentElement.addEventListener('touchmove', this.onToggleWidthMousemove, true)
    document.documentElement.addEventListener('touchend touchcancel', this.onToggleWidthMouseup, true)

    this.$nextTick(() => {
      this.onResize()
      this.$store.commit('setSidebarVisible', true)
    })
  },
  beforeDestroy () {
    document.documentElement.removeEventListener('mousemove', this.onToggleWidthMousemove)
    document.documentElement.removeEventListener('mouseup', this.onToggleWidthMouseup)
    document.documentElement.removeEventListener('mouseleave', this.onToggleWidthMouseup)

    document.documentElement.removeEventListener('touchmove', this.onToggleWidthMousemove, true)
    document.documentElement.removeEventListener('touchend touchcancel', this.onToggleWidthMouseup, true)
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
      debounce(() => {
        let width
        let widthPercentage = this.widthPercentage
        let rightMargin = 150
        if (this.mapSize) {
          if (this.mapSize.width < 600) {
            // sidebar breakpoint set at 600px
            widthPercentage = 95
            rightMargin = 25
          }
          width = this.mapSize.width * widthPercentage / 100
          width = Math.min(this.mapSize.width - rightMargin, width)
          width = Math.max(300, width)
        } else {
          width = 300
        }
        // this.width = Math.max(this.widthPercentage * 10, Math.min((this.widthPercentage + 10) * 100, width))
        this.width = width
      }, 300, true)()
    },
    onToggleClick () {
      this.$store.commit('setSidebarVisible', !this.sidebarVisible)
    },
    onToggleWidthClick () {
      if (this.resized) {
        return
      }

      const changed = [45, 60, 75].some(width => {
        if (this.widthPercentage < (width - 5)) {
          this.widthPercentage = width
          return true
        }
      })
      if (!changed) {
        this.widthPercentage = 30
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
      const mouseX = event.pageX || event.touches[0].pageX
      if (event.movementX) {
        this.resized = this.resized || (Math.abs(event.movementX) > 1) || (Math.abs(event.movementY) > 1)
      } else {
        this.resized = true
      }
      const widthPercentage = (mouseX - this.resizeDiff) / this.mapSize.width * 100
      this.widthPercentage = Math.min(90, Math.max(30, widthPercentage))
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
  font-size: 1.4em;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  margin-top: 20px;
  margin-bottom: 10px;
}
</style>
