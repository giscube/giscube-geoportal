<template>
  <div class="panel place-panel">
    <div class="panel-content">
      <p class="panel-title">{{ $t('names.coords') | capitalize }}</p>

      <div v-if="error">
        {{ error }}
      </div>
      <div v-else class="row-info">
        <q-icon name="place" size="20px" /> GPS: {{ coordinates }}
      </div>

      <div class="row reverse">
        <q-btn outline no-caps
          icon="zoom_in"
          :disable="!this.coords"
          :label="$t('actions.zoom') | capitalize"
          @click="zoomResult"
        />
      </div>

    </div>
  </div>
</template>

<script>
import { QBtn, QIcon } from 'quasar'
import L from 'src/lib/leaflet'

export function coordsRegex () {
  return /^([\w.,]+),? ([\w.,]+)$/g
}

export default {
  components: {
    QBtn,
    QIcon
  },
  data () {
    return {
      result: null,
      coords: null,
      error: null
    }
  },
  mounted () {
    this.result = this.$route.params
    this.applyResult()
  },
  beforeRouteUpdate (to, from, next) {
    this.result = to.params
    this.applyResult()
    next()
  },
  destroyed () {
    if (this.coords) {
      this.coords.remove()
    }
  },
  computed: {
    coordinates () {
      return this.result && this.result.coords
    },
    resultsLayer () {
      return this.$store.state.resultsLayer
    },
    map () {
      return this.$store.state.map.mapObject
    }
  },
  watch: {
    'map': 'applyResult',
    'resultsLayer': 'applyResult'
  },
  methods: {
    applyResult () {
      if (!this.map || !this.resultsLayer) {
        // wait everything to be loaded
        return
      }

      if (this.result.espg !== '4326') {
        this.error = 'Invalid ESPG'
        return
      }

      const coords = coordsRegex().exec(this.result.coords)
      if (!coords) {
        this.error = 'Invalid coordinate'
        return
      }

      let lat, lng
      try {
        lat = parseFloat(coords[1])
        lng = parseFloat(coords[2])
      } catch (e) {
        this.error = 'Invalid coordinate'
        return
      }

      if (this.coords) {
        this.coords.remove()
      }

      // TODO coordinates may be invalid or swaped
      // TODO setup zoom in config
      this.coords = L.marker([lat, lng]).addTo(this.resultsLayer, 19)

      this.zoomResult()
    },
    zoomResult () {
      if (this.map) {
        this.map.flyTo(this.coords.getLatLng())
      }
    }
  }
}
</script>

<!-- Style reused from PlacePanel.vue -->
