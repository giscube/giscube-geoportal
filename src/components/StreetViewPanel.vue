<template>
  <div class="panel streetview-panel">
    <div class="panel-content column">
      <div class="panel-title">Google Street View </div>

      <div>{{ q }}</div>

      <div
        id="street-view-panel-street-view"
        ref="streetview"
        class="street-view-container"
      ><q-spinner /> Street view</div>
      </div>
  </div>
</template>

<script>
import L from 'leaflet'
import gmapsInit from '../lib/gmaps'

export default {
  name: 'StreetViewPanel',
  props: ['map'],
  data () {
    return {
      q: '',
      panorama: null,
      marker: null,
      positionChangedEnabled: true
    }
  },
  watch: {
    'map': 'mapChanged',
    'q': 'qChanged',
    '$store.state.query': 'queryChanged'
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      console.log('Street view check:', to.params.q)
      vm.q = to.params.q
      vm.mapChanged()
    })
  },
  beforeRouteUpdate (to, from, next) {
    console.log('Street view check:', to.params.q)
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
    clickHandler (event) {
      let latlng = event.latlng
      this.panorama.setPosition({ lat: latlng.lat, lng: latlng.lng })
    },
    getHeading () {
      let position = this.panorama.getPosition()
      let latlng = { lat: position.lat(), lng: position.lng() }
      if (this.$store.state.query) {
        let p1 = latlng
        let p2 = this.$store.state.query.latlng
        // Adapted from: https://gist.github.com/conorbuck/2606166
        return Math.atan2(p2.lng - p1.lng, p2.lat - p1.lat) * 180 / Math.PI
      } else {
        return 0
      }
    },
    async mapChanged () {
      if (!this.map) {
        return
      }

      await gmapsInit(this.$config.tools.streetview.apiKey)

      if (!(window.google && window.google.maps)) {
        // try later
        console.log('Google maps api not ready yet')
        let self = this
        setTimeout(function () {
          self.mapChanged()
        }, 500)
        return
      }

      // The control is set to follow the query marker
      // this.$store.commit('setCurrentTool', this)
      // this.map.on('click', this.clickHandler)

      let mapInfo = this.map.giscube.getMapInfo()
      let center

      if (this.$store.state.query) {
        center = this.$store.state.query.latlng
      } else {
        center = mapInfo.visibleBounds.getCenter()
      }

      let icon = L.icon({
        iconUrl: '',
        shadowUrl: '',
        iconSize: [40, 40],
        shadowSize: [50, 64],
        iconAnchor: [20, 35],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
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
      this.marker.addTo(this.map)
      this.marker.on('dragend', this.markerDragEnd)
      L.DomUtil.addClass(this.marker._icon, 'street-view-marker')

      this.panorama = new window.google.maps.StreetViewPanorama(
        document.getElementById('street-view-panel-street-view'), {
          position: center,
          pov: { heading: 0, pitch: 0 },
          zoom: 1
        })

      this.panorama.addListener('position_changed', this.positionChanged)

      this.streetViewService = new window.google.maps.StreetViewService()
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
    qChanged () {
      console.log('street view q changed')
    },
    positionChanged () {
      // Panorama generated a position_changed event
      if (!this.positionChangedEnabled) {
        return
      }

      let position = this.panorama.getPosition()
      let latlng = { lat: position.lat(), lng: position.lng() }
      this.marker.setLatLng(latlng)
      this.panorama.setPov({
        heading: this.getHeading(),
        pitch: 0
      })
    },
    queryChanged () {
      if (this.$store.state.query) {
        let latlng = this.$store.state.query.latlng

        this.streetViewService.getPanorama({
          location: { lat: latlng.lat, lng: latlng.lng },
          radius: 50
        }, this.processSVData)
      }
    },
    processSVData (data, status) {
      if (status === window.google.maps.StreetViewStatus.OK) {
        this.panorama.setPano(data.location.pano)
        this.panorama.setPov({
          heading: this.getHeading(),
          pitch: 0
        })
      } else {
        console.log('Street View data not found for this location.')
      }
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

  #street-view-panel-street-view {
    min-height: 100px;
  }

}

.street-view-marker {
  fill: #fdc02d;
  stroke: black;
  stroke-width: 4;
}
</style>
