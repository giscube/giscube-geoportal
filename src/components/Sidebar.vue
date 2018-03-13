<template>
  <div>
    <form @submit="submit" id="search_form" class="search-form" role="search">
      <div class="input-group">
          <input ref="search_input" id="search_input" type="text" class="form-control" placeholder="Search"
                 style="width: 400px">
          <span class="input-group-btn">
            <button class="btn btn-default" type="submit">
              <span class="glyphicon glyphicon-search"></span>
            </button>
          </span>
      </div><!-- /input-group -->
    </form>

    <div ref="sidebar" id="sidebar" class="sidebar">
        <router-view :map='map' />
    </div>
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
.search-form {
  position: absolute;
  top: 75px;
  left: 14px;
  z-index: 10000;
}


.leaflet-sidebar {
  padding: 0px;

  > .leaflet-control {
    border-radius: 0px;
    background: #eeed;
    padding: 0px;
    padding-top: 60px;
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
