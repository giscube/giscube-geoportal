<template>
  <div ref="sidebar" id="sidebar">
      <router-view :map='map' />
  </div>
</template>

<script>
import L from 'leaflet'

export default {
  props: ['map', 'visible'],
  data () {
    return {
      sidebar: null
    }
  },
  watch: {
    'map': 'mapChanged',
    'visible': 'visibleChanged'
  },
  mounted () {
    this.sidebar = L.control.sidebar('sidebar', {
      position: 'left',
      closeButton: true,
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
  },
  methods: {
    mapChanged () {
      this.map.addControl(this.sidebar)

      let self = this
      setTimeout(function () {
        self.sidebar.show()
        self.$emit('visibility-changed', true)
      }, 500)
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
.leaflet-sidebar {
  padding: 0px;

  > .leaflet-control {
    border-radius: 0px;
    background: #eeed;
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
</style>
