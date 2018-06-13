<template>
  <div>
    <form @submit="submit" id="search_form" role="search">
      <div id="custom-search-input">
        <div class="input-group">
            <input ref="search_input" id="search_input" type="text" class="form-control input-lg" placeholder="Search">
            <span class="input-group-btn">
              <button class="btn btn-info btn-lg" type="submit">
                <span class="oi oi-magnifying-glass"></span>
              </button>
            </span>
        </div><!-- /input-group -->
      </div>

      <a v-show="closeButtonVisible" @click.preventDefault="close"
         class="sidebar-close"><span class="oi oi-caret-left"></span></a>
    </form>

    <div ref="sidebar" id="sidebar" class="sidebar wide">
        <router-view :map='map' @needs-wide='setWide' />
    </div>
  </div>

</template>

<script>
import L from 'leaflet'
const worldBounds = L.latLngBounds([[-90, -180], [90, 180]])

export default {
  props: ['map', 'visible'],
  data () {
    return {
      sidebar: null,
      closeButtonVisible: false
    }
  },
  watch: {
    'map': 'mapChanged',
    'visible': 'visibleChanged'
  },
  mounted () {
    this.sidebar = L.control.sidebar('sidebar', {
      position: 'left',
      closeButton: false,
      autoPan: false
    })

    // Available events:
    // show: Show animation is starting, sidebar will be visible.
    // shown: Show animation finished, sidebar is now visible.
    // hide: Hide animation is starting, sidebar will be hidden.
    // hidden: Hide animation finished, sidebar is now hidden.
    let self = this
    this.sidebar.on('hide', function () {
      self.$emit('visibility-changed', false)
    })
    this.sidebar.on('shown', function () {
      self.sidebarShown()
    })
  },
  methods: {
    close () {
      this.sidebar.hide()
      this.closeButtonVisible = false
    },
    getMapInfo () {
      var info = {
        // isVisible: whether the map is not fully covered
        // visibleBounds: visible bounds, null if fully covered
      }

      let sidebar = this.sidebar._container
      let mapBounds = this.map.getBounds()
      let west = mapBounds.getWest()
      let east = mapBounds.getEast()
      let sidebarCover = (east - west) * sidebar.clientWidth / this.map._container.clientWidth

      info.isVisible = sidebar.clientWidth !== this.map._container.clientWidth
      info.coveredLng = sidebarCover
      // mapBounds without the area covered by the sidebar
      info.visibleBounds = L.latLngBounds([
        [mapBounds.getSouthWest().lat, mapBounds.getSouthWest().lng + sidebarCover],
        [mapBounds.getNorthEast().lat, mapBounds.getNorthEast().lng]
      ])
      info.widthLng = east - west
      info.visibleWidthPx = this.map._container.clientWidth - sidebar.clientWidth
      info.visibleHeightPx = this.map._container.clientHeight
      info.visibleWidthMeters = mapBounds.getNorthEast().distanceTo(mapBounds.getNorthWest())
      info.visibleHeightMeters = mapBounds.getSouthEast().distanceTo(mapBounds.getNorthEast())
      info.sidebarWidthPx = sidebar.clientWidth
      info.isViewValid = worldBounds.contains(info.visibleBounds)

      return info
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
    submit (event) {
      event.preventDefault()
      let q = this.$refs.search_input.value
      this.$store.commit('setAutoselectResult', true)
      this.$emit('search-start', q)
    },
    mapChanged () {
      this.map.addControl(this.sidebar)

      let self = this
      setTimeout(function () {
        self.sidebar.show()
        self.$emit('visibility-changed', true)
      }, 500)
      // extend map functionality the hacky way
      if (!this.map.giscube) {
        this.map.giscube = {}
      }
      this.map.giscube.getMapInfo = this.getMapInfo
    },
    sidebarShown () {
      this.closeButtonVisible = true
    },
    visibleChanged () {
      if (this.visible) {
        this.sidebar.show()
      }
    }
  }
}
</script>

<style lang="scss">
/* search form */
#search_form {
  position: absolute;
  top: 60px;
  z-index: 5000;
  padding: 15px 20px;
  transition: left .5s, width .5s;
  width: 100%;
}

#custom-search-input {
  border: solid 1px #E4E4E4;
  border-radius: 4px;
  background-color: #fff;
  margin-bottom: 20px;
  margin-right: 40px;
}

#custom-search-input input {
  border: 0;
  box-shadow: none;
}

#custom-search-input button {
  margin: 4px 0;
  background: none;
  box-shadow: none;
  border: 0;
  color: #7c7c7d;
  padding: 0 12px;
  border-left: solid 1px #ddd;
  border-radius: 0;
}

#custom-search-input button:hover {
  border: 0;
  box-shadow: none;
  border-left: solid 1px #ccc;
  color: #000;
}

#custom-search-input span {
  font-size: .8em;
}

.leaflet-sidebar.wide {
  width: 70%;
}

/* sidebar */
.leaflet-sidebar {
  padding: 0px;
  box-shadow: 0 1px 7px rgba(0,0,0,.65);
  padding-top: 70px;
  background-color: #eeeeeeeb;

  > .leaflet-control {
    border-radius: 0px;
    background-color: transparent;
    padding: 0px;
  }

  .close {
    z-index: 800;
    right: 10px;
    top: 10px;
  }
}

.leaflet-touch .leaflet-sidebar {
  > .leaflet-control {
    border: 0px;
  }
}

a.sidebar-close {
  z-index: 1800;
  right: 20px;
  top: 16px;
  position: absolute;
  font-size: 25px;
  line-height: 1em;
  text-align: center;
  background: #3b99fc;
  cursor: pointer;
  font-size: .85em;
  padding: 13px 16px;
  border-radius: 4px;
}

a.sidebar-close span {
  color: #fff
}

a.sidebar-close:hover {
  color: #fff;
  background: #636363;
}

/*media query*/
@media (min-width: 768px) {
    .nav-item.user {
      border-top: none
    }
    .leaflet-sidebar, #search_form {
      width: 305px;
    }
    .leaflet-sidebar .plega {
      right: -22px;
      padding: 13px 8px;
      border-radius:0 4px 4px 0
    }
    #custom-search-input {
      margin-right: 0
    }
    a.sidebar-close {
      right: -23px;
      padding: 13px 8px;
      border-radius: 0 4px 4px 0;
    }
}

@media (min-width: 992px) {
    .leaflet-sidebar, #search_form {
      width: 360px;
    }
}

@media (min-width: 1200px) {
    .leaflet-sidebar, #search_form {
      width: 466px;
    }
}

</style>
