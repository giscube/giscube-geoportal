<template>
  <div class="panel result-panel">
    <div class="panel-content">
      <p class="panel-title">{{ title }}</p>

      <div v-if="address" class="row-info">
        <q-icon name="home" size="1.4em" /> {{ address }}
      </div>

      <div v-if="coordinates" class="row-info">
        <q-icon name="place" size="1.4em" /> GPS: {{ coordinates }}
      </div>

      <div v-if="description" class="description">
        {{ description }}
      </div>

      <div class="row reverse q-mt-md">
        <q-btn outline no-caps
          icon="zoom_in"
          :label="$t('actions.zoomToData') | capitalize"
          @click="zoom"
          class="q-ml-md"
        />

        <q-btn outline no-caps
          icon="layers"
          :label="$t('actions.pinToMap') | capitalize"
          @click="pin"
        />
      </div>

      <div class="metadata" v-if="result && metadata && metadata.length > 0">
        <p class="panel-subtitle">{{ $t('names.metadata') | capitalize }}</p>
        <table>
          <tr
            v-for="(datum, i) in metadata"
            :key="'metadata-' + i"
          >
            <td>{{ datum.name }}</td>
            <td v-if="datum.href"><a :href="datum.href" target="_blank">{{ datum.text }}</a></td>
            <td v-else>{{ datum.text }}</td>
          </tr>
        </table>
      </div>

      <div class="keywords" v-if="keywords">
        <div class="panel-subtitle">{{ $t('names.keywords') | capitalize }}</div>
        <q-chip
          v-for="keyword in keywords"
          :key="keyword"
          clickable
          square
          @click="$router.push({name: 'search', params: {q: keyword}})"
        >
          {{ keyword }}
        </q-chip>
      </div>

    </div>
  </div>
</template>

<script>
import L from '../lib/leaflet'
import { QChip, QBtn, QIcon } from 'quasar'

export default {
  components: {
    QChip,
    QBtn,
    QIcon
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('search/clearResultLayer')
      const redirect = vm.applyParameters(to.params)
      if (redirect) {
        vm.$router.replace({ name: 'search', params: to.params })
      }
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.$store.dispatch('search/clearResultLayer')
    next({ name: 'search', params: to.params })
  },
  beforeRouteLeave (to, from, next) {
    this.$store.dispatch('search/clearResultLayer')
    next()
  },
  computed: {
    map () {
      return this.$store.state.map.mapObject
    },
    query () {
      return this.$store.state.search.query
    },
    result () {
      return this.$store.state.search.result
    },
    resultsLayer () {
      return this.$store.state.search.resultsLayer
    },

    // To override
    address () {
      return null
    },
    coordinates () {
      return null
    },
    description () {
      return null
    },
    geom () {
      return null
    },
    keywords () {
      return null
    },
    metadata () {
      return null
    },
    title () {
      return null
    }
  },
  methods: {
    pin () {},
    zoom () {
      const maxZoom = this.$config.layout.mapMaxFlyZoom
      const pointZoom = this.$config.layout.mapPointZoom
      const zoomPadding = this.$config.layout.mapZoomPadding
      if (this.geom) {
        if (this.geom.getLatLng) {
          this.map.flyTo(this.geom.getLatLng(), Math.min(pointZoom, maxZoom))
          return
        } else if (this.geom.getBounds) {
          this.map.flyToBounds(this.geom.getBounds().pad(zoomPadding), {
            maxZoom
          })
          return
        }
      }

      // If we can't zoom, go to home view
      const home = this.$store.config.home
      this.map.flyTo(new L.LatLng(home.center.lat, home.center.lng), home.zoom)
    }
  }
}
</script>

<style lang="scss">
.result-panel {
  .row-info {
    margin-bottom: 15px;
  }
  .description {
    margin-bottom: 15px;
  }

  .q-chip {
    color: #0a1923;
    background-color: #a1d7f5 !important;
  }
}
</style>
