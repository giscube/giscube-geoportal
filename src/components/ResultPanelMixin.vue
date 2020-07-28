<template>
  <div class="panel result-panel fit">
    <div class="panel-content limit-parent column no-wrap">
      <div class="row no-wrap">
        <p class="panel-title">
          <q-btn flat dense
            icon="keyboard_arrow_left"
            size="md"
            @click="$router.go(-1)"
          />
          {{ title }}
        </p>
        <q-space />
        <q-btn
          v-if="canAggregate"
          icon="assessment"
          @click.stop="gotoStatistics"
        />
      </div>

      <div v-if="address">
        <q-icon name="home" size="1.4em" /> {{ address }}
      </div>

      <div v-if="latlng" class="result-panel-latlng">
        <template
          v-for="epsg in $config.epsgs"
        >
          <q-icon name="place" size="1.4em" :key="'result--' + epsg.code + '--icon'" />
          <b :key="'result--' + epsg.code + '--label'">{{ epsg.label }}:</b>
          <span :key="'result--' + epsg.code + '--value'">{{ projected(epsg) }}</span>
        </template>
      </div>
      <div v-else-if="coordinates">
        <q-icon name="place" size="1.4em" /> GPS: {{ coordinates }}
      </div>

      <div v-if="description" class="description">
        {{ description }}
      </div>

      <div class="row space-items-sm">
        <q-btn-group flat>
          <q-btn no-caps
            v-show="canDownload"
            icon="save_alt"
            @click="download"
          >
            <q-tooltip>
              {{$t('actions.download') | capitalize}}
            </q-tooltip>
          </q-btn>

          <q-btn no-caps icon="zoom_in" @click="zoom">
            <q-tooltip>
              {{$t('actions.zoomToData') | capitalize}}
            </q-tooltip>
          </q-btn>

          <q-btn no-caps
            :disabled="!supportsTooltip"
            icon="las la-tag"
            @click="toggleTooltip"
          >
            <q-tooltip>
              {{$t('actions.tooltip') | capitalize}}
            </q-tooltip>
          </q-btn>

          <q-btn no-caps
            :disabled="!canPin"
            icon="layers"
            :label="$t('actions.pinToMap') | capitalize"
            @click="pin"
          />
        </q-btn-group>
      </div>

      <slot name="after-tools"></slot>

      <div class="metadata" v-if="result && metadata && metadata.length > 0">
        <p class="panel-subtitle">{{ $t('names.metadata') | capitalize }}</p>
        <div
          v-for="(datum, i) in metadata"
          :key="'metadata-' + i"
        >
          <table>
            <tr v-show="datum.type">
              <td>{{ $t('names.type') | capitalize }}</td>
              <td>{{ datum.type }}</td><br>
            </tr>
            <tr>
              <td>{{ datum.name }}</td>
              <td v-if="datum.href">
                <a :href="datum.href" target="_blank">{{ datum.text }}</a>
              </td>
              <td v-else>{{ datum.text }}</td>
            </tr>
          </table>

          <div class="row q-pt-sm space-items-sm">
            <q-btn outline no-caps
              v-clipboard:copy="datum.text"
              v-clipboard:success="doCopy"
              :icon="copied ? 'fas fa-check' : 'fas fa-copy'"
              :label="$t('actions.copy') + ' URL' | capitalize"
              :color="copied ? 'green' : void 0"
            />
            <q-btn outline no-caps
              v-if="datum.type.toLowerCase() === 'geojson'"
              icon="search"
              :label="$t('actions.explore') | capitalize"
              @click="open(datum.text)"
            />
            <q-btn outline no-caps
              v-else-if="datum.type.toLowerCase() === 'wms'"
              icon="search"
              :label="$t('actions.explore') | capitalize"
              @click="open(datum.href)"
            />
          </div>
        </div>
      </div>

      <div class="legend" v-if="result && legend">
        <p class="panel-subtitle">{{ $t('names.legend') | capitalize }}</p>
        <div v-html="legend"></div>
      </div>

      <div class="keywords" v-if="keywords">
        <div class="panel-subtitle">{{ $t('names.keywords') | capitalize }}</div>
        <q-chip
          v-for="keyword in keywords"
          :key="keyword"
          clickable
          square
          @click="searchKeyword(keyword)"
          v-show="keyword !== ''"
        >
          {{ keyword }}
        </q-chip>
      </div>

      <div
        v-if="table"
        class="col column no-wrap"
      >
        <div class="row items-center space-items-sm" v-if="table && table.info">
          <data-filter :table="table" />
          <q-space />
          <selection-controls :table="table" />
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
import { QChip, QBtn, QBtnGroup, QIcon, QSpace, QTooltip } from 'quasar'
import { mapState } from 'vuex'
import { formatCoords } from 'src/lib/geomUtils'

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
    QBtnGroup,
    QIcon,
    QSpace,
    QTooltip
  },
  data () {
    return {
      copied: false,
      isTooltipEnabled: false
    }
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
    canAggregate () {
      return false
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
    latlng () {
      return null
    },
    legend () {
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
    },
    canPin () {
      return false
    },

    supportsTooltip () {
      const layers = this.layer && this.layer.getLayers && this.layer.getLayers()
      return layers && layers.length > 0 && layers[0].getTooltip
    }
  },
  methods: {
    doCopy () {
      this.copied = true
    },
    download () {},
    gotoStatistics () {},
    open (url) {
      window.open(url)
    },
    pin () {},
    projected (epsg) {
      return formatCoords(this.latlng, epsg)
    },
    searchKeyword (keyword) {
      this.$store.dispatch('search/search', { query: keyword, auto: false })
      this.$router.push({
        name: 'search',
        params: { q: keyword }
      })
    },
    toggleTooltip () {
      this.isTooltipEnabled = !this.isTooltipEnabled
      this.layer.eachLayer(layer => {
        if (layer.getTooltip) {
          const tooltip = layer.getTooltip()
          layer.unbindTooltip().bindTooltip(tooltip, {
            permanent: this.isTooltipEnabled
          })
        }
      })
    },
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
    }
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

  .result-panel-latlng
    white-space: nowrap
    display: grid
    grid-template-columns: auto auto auto
    grid-column-gap: 0.8em
    max-width: min-content

</style>
