<template>
  <div class="panel result-panel fit">
    <div class="panel-content limit-parent column no-wrap">
      <p class="panel-title">{{ title }}</p>

      <div v-if="address">
        <q-icon name="home" size="1.4em" /> {{ address }}
      </div>

      <div v-if="coordinates">
        <q-icon name="place" size="1.4em" /> GPS: {{ coordinates }}
      </div>

      <div v-if="description" class="description">
        {{ description }}
      </div>

      <div class="row justify-end space-items-sm">
        <q-btn outline no-caps
          v-show="canDownload"
          icon="save_alt"
          :label="$t('actions.download') | capitalize"
          @click="download"
        />

        <q-btn outline no-caps
          icon="zoom_in"
          :label="$t('actions.zoomToData') | capitalize"
          @click="zoom"
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
          @click="searchKeyword(keyword)"
        >
          {{ keyword }}
        </q-chip>
      </div>

      <div
        v-if="table"
        class="col column no-wrap"
      >
        <div class="row items-center space-items-sm" v-if="table && table.info">
          <data-filter
            :table="table"
          />
          <q-space />
          <selection-controls
            :table="table"
          />
        </div>
        <div class="full-width col q-mt-sm">
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
import { isCleanEqual } from 'src/lib/utils'

import DataFilter from './data-layer/DataFilter'
import DataTable from './data-layer/DataTable'
import SelectionControls from './data-layer/SelectionControls'

export default {
  components: {
    DataFilter,
    DataTable,
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
    if (isCleanEqual(from.params, to.params)) {
      next()
      return
    }

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
      map: state => state.map.mapObject,
      query: state => state.search.query,
      result: state => state.search.result,
      resultsLayer: state => state.search.resultsLayer
    }),

    // To override
    address () {
      return null
    },
    canDownload () {
      return false
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
    searchKeyword (keyword) {
      this.$store.dispatch('search/search', { query: keyword, auto: false })
      this.$router.push({
        name: 'search',
        params: { q: keyword }
      })
    },
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
      const home = this.$config.home
      this.map.flyTo(new L.LatLng(home.center.lat, home.center.lng), home.zoom)
    },
    download () {}
  }
}
</script>

<style lang="stylus">
.result-panel
  > .panel-content > :not(:last-child)
     margin-bottom: $spaces.md.y

  .q-chip
    color: #0a1923
    background-color: #a1d7f5 !important

  .metadata table td
    padding: $spaces.xs.y $spaces.xs.x

</style>
