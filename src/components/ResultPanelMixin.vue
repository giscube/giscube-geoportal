<template>
  <div class="panel result-panel fit">
    <div class="panel-content limit-parent column no-wrap">
      <p class="col panel-title">{{ title }}</p>

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

      <div
        v-if="table"
        class="q-mt-lg col column no-wrap"
      >
        <div class="row items-center justify-end q-mb-md" v-if="table && table.info">
          <draw-controls
            v-if="drawing"
          />
          <data-filter
            v-else
            :table="table"
          />
          <q-space />
          <selection-controls
            :table="table"
          />
        </div>
        <div class="full-width col">
          <data-table
            class="limit-parent"
            v-if="table.info"
            :table="table"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import L from '../lib/leaflet'
import { QChip, QBtn, QIcon, QSpace } from 'quasar'
import { mapState } from 'vuex'

import DataFilter from './data-layer/DataFilter'
import DataTable from './data-layer/DataTable'
import DrawControls from './data-layer/DrawControls'
import SelectionControls from './data-layer/SelectionControls'

export default {
  components: {
    DataFilter,
    DataTable,
    DrawControls,
    SelectionControls,
    QChip,
    QBtn,
    QIcon,
    QSpace
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
    const redirect = this.applyParameters(to.params)
    if (redirect) {
      next({ name: 'search', params: to.params })
    } else {
      next()
    }
  },
  beforeRouteLeave (to, from, next) {
    this.$store.dispatch('search/clearResultLayer')
    next()
  },
  computed: {
    ...mapState({
      drawing: state => state.map.drawing,
      map: state => state.map.mapObject,
      query: state => state.search.query,
      result: state => state.search.result,
      resultsLayer: state => state.search.resultsLayer
    }),

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
    table () {
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
