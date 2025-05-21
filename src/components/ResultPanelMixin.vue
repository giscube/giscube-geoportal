<template>
  <div class="panel result-panel fit">
    <div class="panel-content limit-parent column no-wrap">
      <div class="panel-title space row">
        <q-btn flat dense
          icon="keyboard_arrow_left"
          size="md"
          @click="$router.go(-1)"
        />
        {{ title }}
        <q-space />
        <q-btn
          v-if="routeInfoGiscubeId"
          flat round
          color="black"
          icon="las la-info-circle"
          @click="openInfoGiscubeId"
        >
          <q-tooltip>
            {{$t('names.layerInfo') | capitalize}}
          </q-tooltip>
        </q-btn>
      </div>
      <div class="">
        <q-btn-group class="no-shadow">
          <q-btn-dropdown v-show="canDownload" flat icon="save_alt">
            <q-list>
              <q-item clickable v-close-popup @click="downloadLayer('geojson')">
                <q-item-section style="width: 140px">
                  <q-item-label>{{$t('actions.download') | capitalize}} GeoJSON</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="downloadLayer('dxf')">
                <q-item-section>
                  <q-item-label>{{$t('actions.download') | capitalize}} DXF</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            icon="zoom_in"
            @click="zoom"
          >
            <q-tooltip>
              {{$t('actions.zoomToData') | capitalize}}
            </q-tooltip>
          </q-btn>

          <q-btn no-caps
            v-show="supportsTooltip"
            icon="las la-tag"
            @click="toggleTooltip"
          >
            <q-tooltip>
              {{$t('actions.tooltip') | capitalize}}
            </q-tooltip>
          </q-btn>

          <q-btn no-caps
            v-show="hasDataPerm"
            icon="las la-pencil-alt"
            @click="goToDataPanel"
          >
            <q-tooltip>
              {{$t('tools.data.title') | capitalize}}
            </q-tooltip>
          </q-btn>

          <q-btn
            v-show="canPin"
            icon="layers"
            :label="$t('actions.pinToMap') | capitalize"
            @click="pin"
          />
        </q-btn-group>
      </div>
      <q-space />

      <slot name="after-tools"></slot>

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

      <q-tabs
        v-else
        v-model="tab"
        dense
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab v-if="isInfo" name="info" :label="'Info'" />
        <q-tab v-if="isData" name="data" :label="$t('names.data')"/>
        <q-tab v-if="statisticsEnabled && canAggregate" name="statistics" :label="$t('names.statistics')"/>
        <q-tab v-if="canAggregate" name="heat-map" :label="$t('tools.heatMap.title')"/>
        <q-tab v-if="isExternalSearchResult" name="search-result" :label="$t('names.searchResult')" />
        <q-tab v-if="isNotMarker" name="utilities" :label="$t('names.utilities')" />
      </q-tabs>

      <!-- Tab Info -->
      <div v-show="tab === 'info'" class="column no-wrap limit-parent">
        <slot name="info-tab">
          <info-tab
            :description="description"
            :result="result"
            :legend="legend"
            :downloads="downloads"
            :metadata="metadata"
            :layerDescriptor="layerDescriptor"
            :keywords="keywords"
          />
        </slot>
      </div>

      <!-- Tab Data -->
      <div v-show="tab === 'data'" debounce="10" class="column no-wrap limit-parent">
        <slot name="data-tab">
          <div
            v-if="table"
            class="col column no-wrap"
          >
            <selection-controls :table="table" />
            <data-layer-table
              class="limit-parent"
              v-if="table.info"
              :table="table"
            />
          </div>
          <data-table
            v-else
            :value="aggregatedData"
            :filteredFields="filteredFields"
            @filtered="setAggregated"
          />
        </slot>
      </div>

      <!-- Tab Statistics -->
      <div v-show="tab === 'statistics'" class="column no-wrap limit-parent">
        <slot name="statistics-tab">
          <statistics-tab />
        </slot>
      </div>

      <!-- Tab Heat map -->
      <div v-show="tab === 'heat-map'" class="column no-wrap limit-parent">
        <slot name="heat-map-tab">
          <heat-map-tab v-if="canAggregate" :layer="layer" :tab="tab"/>
        </slot>
      </div>

      <div v-show="tab === 'search-result'" class="column no-wrap limit-parent">
        <slot name="search-result-tab">
          <external-search-result-tab :properties="properties" />
        </slot>
      </div>

      <!-- Tab Utilities -->
      <div v-if="tab === 'utilities'" class="column no-wrap limit-parent">
        <slot name="utilities-tab">
          <utilities-tab
            :layer="layer"
          />
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import { formatCoords, getWMSbbox } from 'src/lib/geomUtils'
import { ClosePopup, QBtn, QBtnDropdown, QBtnGroup, QIcon, QItem, QItemSection, QItemLabel, QList, QSpace, QTab, QTabs, QTooltip } from 'quasar'
import L from 'src/lib/leaflet'
import { convertGeoJsonToDXF, downloadDXF } from 'src/lib/fileutils'
import { mapState } from 'vuex'
import { saveAs } from 'file-saver'

import DataLayerTable from './data-layer/DataLayerTable'
import SelectionControls from './data-layer/SelectionControls'

import DataTable from './statistics/DataTable'

import ExternalSearchResultTab from './result-tabs/ExternalSearchResultTab'
import InfoTab from './result-tabs/InfoTab'
import HeatMapTab from './result-tabs/HeatMapTab'
import StatisticsTab from './result-tabs/StatisticsTab'
import UtilitiesTab from './result-tabs/UtilitiesTab'

export default {
  components: {
    DataLayerTable,
    SelectionControls,
    DataTable,
    ExternalSearchResultTab,
    InfoTab,
    HeatMapTab,
    StatisticsTab,
    UtilitiesTab,
    QBtn,
    QBtnDropdown,
    QBtnGroup,
    QIcon,
    QItem,
    QItemSection,
    QItemLabel,
    QList,
    QSpace,
    QTab,
    QTabs,
    QTooltip
  },
  data () {
    return {
      tab: 'info'
    }
  },
  beforeDestroy () {
    if (this.overlay) {
      this.overlay.layer.options = this.layer.options
      this.overlay.layer.options.filter = this.$store.state.statistics.filter
      this.overlay.layer.options.colFilters = this.$store.state.statistics.colFilters
      this.overlay.layer.options.filterPolygon = this.$store.state.statistics.filterPolygon
      this.overlay.aggregatedData = this.aggregatedData
      this.overlay.statsOption = this.byOption
    }
    this.$store.dispatch('statistics/clearStats')
  },
  computed: {
    ...mapState({
      query: state => state.search.query,
      map: state => state.map.mapObject,
      result: state => state.search.result,
      resultsLayer: state => state.search.resultsLayer
    }),
    ...mapState('statistics', ['aggregated', 'aggregatedData', 'aggregatedTitle', 'byOption']),
    supportsTooltip () {
      const layers = this.layer && this.layer.getLayers && this.layer.getLayers()
      return layers && layers.length > 0 && layers[0].getTooltip
    },
    isData () {
      return this.canAggregate || this.table
    },
    isExternalSearchResult () {
      return this.result && this.result.origin && this.result.origin.name && this.result.origin.name !== 'geoportal' && this.properties
    },
    isInfo () {
      return this.result && this.result.giscube_id
    },
    isNotMarker () {
      if (this.isExternalSearchResult) {
        return false
      }
      if (this.result && this.result.geojson && this.result.geojson.type) {
        return !this.result.geojson.type.includes('Point')
      }
      if (!this.isDescriptionGeoJSON) {
        return true
      }
      if (this.layer && typeof this.layer.getLayers === 'function') {
        const layer = this.layer.getLayers().length > 0 && this.layer.getLayers()[0]
        return layer && layer.feature && layer.feature.geometry && !layer.feature.geometry.type.includes('Point')
      }
      return null
    },
    hasDataPerm () {
      return this.table && this.table.info.permissions?.update
    },
    routeInfoGiscubeId () {
      return (
        this.isInfo &&
        this.$router.options.routes.find(({ path }) => path === '/info')?.children.some(({ name }) => name === 'giscube_id')
      )
    },
    statisticsEnabled () {
      return this.$config.tools.statistics.enabled
    },
    filteredFields () {
      return this.result && this.result.filtered_fields
    },

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
    layerDescriptor () {
      return null
    },
    legend () {
      return null
    },
    metadata () {
      return null
    },
    overlay () {
      return null
    },
    downloads () {
      return null
    },
    table () {
      return null
    },
    title () {
      return null
    },
    layerName () {
      return null
    },
    canPin () {
      return false
    }
  },
  directives: {
    ClosePopup
  },
  watch: {
    aggregated: function (aggregatedLayers) {
      if (this.layer && this.layer.clearLayers && this.layer.clearLayers()) {
        this.layer.clearLayers()
        aggregatedLayers.forEach(layer => {
          this.layer.addLayer(layer)
        })
      }
      if (this.overlay) {
        this.pin()
      }
    },
    layer: function (layer) {
      if (this.canAggregate) {
        this.$store.commit('statistics/filter', layer.options.filter || '')
        this.$store.commit('statistics/colFilters', layer.options.colFilters || {})
        this.$store.dispatch('statistics/setFilterPolygon', layer.options.filterPolygon)
        if (this.overlay.aggregatedData) {
          this.$store.commit('statistics/aggregatedData', this.overlay.aggregatedData)
        } else if (!this.table_) {
          this.$store.dispatch('statistics/setAggregated', { layers: layer, title: this.title })
        }
      }
    },
    table: function (table) {
      if (table && !this.isInfo) {
        this.tab = 'data'
      }
    },
    result: function (newResult) {
      const validTabs = []
      if (this.isInfo) validTabs.push('info')
      if (this.isData) validTabs.push('data')
      if (this.statisticsEnabled && this.canAggregate) validTabs.push('statistics')
      if (this.canAggregate) validTabs.push('heat-map')
      if (this.isExternalSearchResult) validTabs.push('search-result')
      if (this.isNotMarker) validTabs.push('utilities')

      if (!validTabs.includes(this.tab)) {
        this.tab = validTabs[0] || 'info'
      }
    }
  },
  methods: {
    downloadLayer (fileType) {
      if (this.canDownload) {
        this.$axios.get(this.layerOptions.layerDescriptor.url, {
          headers: this.layerOptions.headers,
          responseType: 'json'
        })
          .then(result => {
            const data = result.data
            data.features = this.aggregated.map((layer) => { return layer.feature })
            if (fileType === 'geojson') {
              const dataBlob = new Blob([JSON.stringify(data)], { type: 'application/json' })
              saveAs(dataBlob, 'result.geojson')
            } else if (fileType === 'dxf') {
              const dataDXF = convertGeoJsonToDXF(data)
              downloadDXF(dataDXF)
            }
          })
      }
    },
    pin () {},
    projected (epsg) {
      return formatCoords(this.latlng, epsg)
    },
    openInfoGiscubeId () {
      const url = `${location.href.split('#')[0]}#/info/giscube_id/${this.result && this.result.giscube_id}`
      window.open(url, '_blank')
    },
    setAggregated (data) {
      requestAnimationFrame(() => {
        this.$store.commit('statistics/aggregated', data)
        this.$store.dispatch('statistics/aggregate')
      })
    },
    toggleTooltip () {
      this.isTooltip = !this.isTooltip
      this.layer.eachLayer((l) => {
        if (l.getTooltip()) {
          var tooltip = l.getTooltip()
          l.unbindTooltip().bindTooltip(tooltip, {
            permanent: this.isTooltip
          })
        }
      })
    },
    goToDataPanel () {
      this.$store.dispatch('dataLayer/refreshSources')
        .then(() => {
          const sources = this.$store.getters['dataLayer/sources']
          for (let sourceKey in sources) {
            if (sources.hasOwnProperty(sourceKey)) {
              const source = sources[sourceKey]
              if (source.layers && Array.isArray(source.layers)) {
                for (let layer of source.layers) {
                  if (layer.name === this.layerName) {
                    this.$router.push({
                      name: 'data',
                      params: {
                        sourceName: source.name, layerName: this.layerName
                      }
                    })
                    return
                  }
                }
              }
            }
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
      if (this.layerDescriptor.length > 0 && this.layerDescriptor[0].type.toLowerCase() === 'wms') {
        getWMSbbox(this.layerDescriptor[0].href, this.layerOptions).then(bbox => {
          if (bbox) {
            this.map.fitBounds([
              [bbox[1], bbox[0]],
              [bbox[3], bbox[2]]
            ])
          }
        })
        return
      }
      if (this.layerDescriptor.length > 0 && this.layerDescriptor[0].bbox) {
        const bbox = this.layerDescriptor[0].bbox.split(',')
        this.map.fitBounds([
          [bbox[1], bbox[0]],
          [bbox[3], bbox[2]]
        ])
        return
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

  .result-panel-latlng
    white-space: nowrap
    display: grid
    grid-template-columns: auto auto auto
    grid-column-gap: 0.8em
    max-width: min-content

</style>
