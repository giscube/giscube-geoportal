<template>
  <div class="panel streetview-panel">
    <div class="panel-content column no-wrap">
      <div class="row">
        <div class="panel-title space">{{ t('title') }}</div>
        <q-btn
          flat
          @click="center"
          icon="room"
        >
          <q-tooltip>
            {{ t('centerMap') }}
          </q-tooltip>
        </q-btn>
      </div>

      <div>{{ q }}</div>

      <div class="col column no-wrap relative-position street-view__container">
        <div
          id="street-view-panel-street-view"
          ref="streetview"
          class="street-view-container"
        >
          <div v-if="!streetViewService">
            <q-spinner class="q-mr-sm" />{{ t('headerName') }}
          </div>
        </div>

        <div v-if="streetViewError" class="absolute-center column no-wrap items-center">
          <q-icon name="warning" color="grey" size="3em" />
          <span>{{ streetViewError }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { QBtn, QIcon, QSpinner, QTooltip } from 'quasar'
import debounce from 'lodash/debounce.js'
import { mapState } from 'vuex'

import L from '../lib/leaflet'
import gmapsInit from '../lib/gmaps'

export default {
  name: 'StreetViewPanel',
  components: {
    QBtn,
    QIcon,
    QSpinner,
    QTooltip
  },
  computed: mapState({
    map: state => state.map.mapObject,
    query: state => state.root.query
  }),
  data () {
    return {
      q: '',
      panorama: null,
      marker: null,
      positionChangedEnabled: true,
      streetViewService: null,
      streetViewError: null
    }
  },
  created () {
    this.resizeStreetView = debounce(() => {
      if (window.google && window.google.maps) {
        window.google.maps.event.trigger(this.panorama, 'resize')
      }
    }, 500)
  },
  watch: {
    'map': 'mapChanged',
    'query': 'queryChanged',
    streetViewError (value) {
      if (this.panorama) {
        this.panorama.setVisible(!value)
      }

      if (this.marker) {
        if (value) {
          this.marker.removeFrom(this.map)
        } else {
          this.marker.addTo(this.map)
        }
      }
    },
    '$store.state.layout.leftDrawerSize' () {
      this.resizeStreetView()
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.q = to.params.q
      vm.mapChanged()
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.q = to.params.q
    next()
  },
  destroyed () {
    if (this.marker) {
      this.marker.removeFrom(this.map)
    }
    this.$store.commit('setCurrentTool', null)
    this.map.off('click', this.clickHandler)
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.streetview.' + key, ...args)
    },
    center () {
      if (this.map && this.marker) {
        this.map.flyTo(this.marker.getLatLng())
      }
    },
    clickHandler (event) {
      let latlng = event.latlng
      this.panorama.setPosition({ lat: latlng.lat, lng: latlng.lng })
    },
    setPov () {
      const pov = this.panorama.getPov()
      if (this.query) {
        const maps = window.google.maps
        const position = this.panorama.getPosition()
        const towards = new maps.LatLng(this.query.latlng)
        pov.heading = maps.geometry.spherical.computeHeading(position, towards)
        this.panorama.setPov(pov)
      }
    },
    async mapChanged () {
      if (!this.map) {
        return
      }

      await gmapsInit(this.$config.google.apiKey)

      if (!(window.google && window.google.maps)) {
        // Google maps api not ready yet
        // try later
        let self = this
        setTimeout(function () {
          self.mapChanged()
        }, 500)
        return
      }

      // The control is set to follow the query marker
      if (!this.$config.streetview.followQueryMarker) {
        this.$store.commit('setCurrentTool', this)
        this.map.on('click', this.clickHandler)
      }

      let center
      if (this.query && this.$store.getters['map/bbox']().contains(this.query.latlng)) {
        center = this.query.latlng
      }
      if (!center) {
        const mapInfo = this.map.giscube.getMapInfo()
        center = mapInfo.visibleBounds.getCenter()
      }

      if (!this.marker) {
        this.setupMarker(center)
      }

      this.marker.addTo(this.map)

      this.panorama = new window.google.maps.StreetViewPanorama(
        document.getElementById('street-view-panel-street-view'), {
          position: center,
          pov: { heading: 0, pitch: 0 },
          zoom: 1
        })

      this.panorama.addListener('position_changed', this.positionChanged)

      this.streetViewService = new window.google.maps.StreetViewService()

      this.setPov()
    },
    markerDragEnd () {
      // marker was moved
      let mapInfo = this.map.giscube.getMapInfo()
      let latlng = this.marker.getLatLng()
      let self = this
      setTimeout(function () {
        self.positionChangedEnabled = true
        self.positionChanged()
      }, 500)
      this.positionChangedEnabled = false
      this.panorama.setPosition(latlng)

      if (mapInfo.isVisible) {
        this.map.panTo({ lat: latlng.lat, lng: latlng.lng - mapInfo.coveredLng / 2 })
      } else {
        this.map.panTo(latlng)
      }
    },
    positionChanged () {
      // Panorama generated a position_changed event
      if (!this.positionChangedEnabled) {
        return
      }

      let position = this.panorama.getPosition()
      let latlng = { lat: position.lat(), lng: position.lng() }
      this.marker.setLatLng(latlng)
      this.setPov()
    },
    queryChanged (query) {
      if (query) {
        this.streetViewService.getPanorama({
          location: query.latlng,
          radius: 50
        }, this.processSVData)
      }
    },
    processSVData (data, status) {
      if (status === window.google.maps.StreetViewStatus.OK) {
        this.streetViewError = null
        this.panorama.setPano(data.location.pano)
        this.setPov()
      } else {
        this.streetViewError = this.$t('tools.streetview.noDataError')
      }
    },
    setupMarker (center) {
      let icon = L.icon({
        iconUrl: '',
        shadowUrl: '',
        iconSize: [40, 40],
        shadowSize: [50, 64],
        iconAnchor: [20, 35],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76],
        className: 'street-view-marker'
      })
      icon.createIcon = function (oldIcon) {
        let div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div')

        div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M192 64c0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64s-64-28.654-64-64zm112 80h-11.36c-22.711 10.443-49.59 10.894-73.28 0H208c-26.51 0-48 21.49-48 48v104c0 13.255 10.745 24 24 24h16v104c0 13.255 10.745 24 24 24h64c13.255 0 24-10.745 24-24V320h16c13.255 0 24-10.745 24-24V192c0-26.51-21.49-48-48-48zm85.642 189.152a72.503 72.503 0 0 1-29.01 27.009C391.133 365.251 480 385.854 480 416c0 46.304-167.656 64-224 64-70.303 0-224-20.859-224-64 0-30.123 88.361-50.665 119.367-55.839a72.516 72.516 0 0 1-29.01-27.009C74.959 343.395 0 367.599 0 416c0 77.111 178.658 96 256 96 77.249 0 256-18.865 256-96 0-48.403-74.967-72.606-122.358-82.848z"/></svg>'

        this._setIconStyles(div, 'icon')

        return div
      }

      this.marker = L.marker(center, {
        draggable: true,
        icon: icon
      })
      this.marker.on('dragend', this.markerDragEnd)
    }
  }
}
</script>

<style lang="scss">
.streetview-panel {
  height: 100%;

  .panel-content {
    height: 100%;
  }

  .street-view-container {
    flex-grow: 1;
  }

  .street-view__container {
    min-height: 100px;
  }

}

.street-view-marker {
  fill: #fdc02d;
  stroke: black;
  stroke-width: 4;
}
</style>
