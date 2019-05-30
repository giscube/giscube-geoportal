<template>
  <q-table
    v-if="fields"
    ref="table"
    class="column no-wrap"
    table-class="data-table col"
    :data="features"
    :columns="columns"
    row-key="id"
    :filter="filter"
    :pagination.sync="pagination"
    :loading="loading"
    selection="multiple"
    :selected="selected"
    binary-state-sort
    :hide-bottom="editing"
    @update:selected="onSelected"
    @request="onRequest"
    :rows-per-page-options="rowsPerPageOptions"
  >
    <template
      v-slot:header-cell="props"
    >
      <q-th
        :props="props"
        :class="{ actions: props.col.name === '__actions' }"
      >
        {{ props.col.label }}
        <q-btn
          v-if="props.col.name !== '__actions'"
          flat
          dense
          size="sm"
          :icon="colFilters[props.col.name] ? 'mdi-filter' : 'mdi-filter-outline'"
          @click.stop=""
        >
          <q-menu>
            <q-card>
              <q-card-section>
                <q-input
                  autofocus
                  :readonly="editing"
                  :label="t('colFilter', {label: props.col.label})"
                  :value="colFilters[props.col.name] || ''"
                  @input="onColFilterInput(props.col, $event)"
                >
                  <template
                    v-slot:append
                    v-if="!editing && colFilters[props.col.name]"
                  >
                    <q-icon name="close" @click.stop="onColFilterInput(props.col, '')" class="cursor-pointer" />
                  </template>
                </q-input>
              </q-card-section>
            </q-card>
          </q-menu>
        </q-btn>
      </q-th>
    </template>
    <template
      v-slot:body="props"
    >
      <q-tr
        :props="props"
        class="data-table-row"
        :class="{ deleted: props.row.status.deleted }"
      >
        <q-td auto-width>
          <q-checkbox color="primary" v-model="props.selected" />
        </q-td>
        <q-td v-if="editing">
          <custom-actions
          :row-data="props.row"
          :row-index="props.row.id"
          @edit="$emit('edit', $event)"
          />
        </q-td>
        <data-cell
          v-for="field in fields"
          :key="props.row + '-' + field.name"
          :feature="props.row"
          :field="field"
        />
      </q-tr>
    </template>
  </q-table>
  <div v-else></div>
</template>

<script>
import Vue from 'vue'
import { QBtn, QCard, QCardSection, QCheckbox, QIcon, QInput, QMenu, QTable, QTd, QTh, QTr } from 'quasar'

import debounce from 'lodash/debounce.js'
import isEqual from 'lodash/isEqual.js'

import makeGeoJsonOptions from '../../lib/makeGeoJsonOptions'
import { addFeatureMixin, setupLayer } from '../../lib/feature.js'
import DataCell from '../../lib/field/components/DataCell'

import databaseLayersApi from '../../api/databaselayers.js'

import CustomActions from './CustomActions'
import MapPopup from './MapPopup'

const rowsPerPageBase = [
  20,
  50,
  100,
  500,
  1000,
  5000,
  10000
]

export default {
  props: {
    filter: {
      type: String,
      default: ''
    },
    mapFilter: {
      type: Boolean,
      default: false
    },
    polygonFilter: String
  },
  components: {
    CustomActions,
    DataCell,
    QBtn,
    QCard,
    QCardSection,
    QCheckbox,
    QIcon,
    QInput,
    QMenu,
    QTable,
    QTd,
    QTh,
    QTr
  },
  data () {
    return {
      loading: false,
      pagination: {
        rowsPerPage: 20,
        page: 1,
        rowsNumber: 0
      },
      colFilters: {},
      bbox: null
    }
  },
  created () {
    this.recalculateSelected = debounce(this._recalculateSelected)
    this.refreshData = debounce(this.refreshDataNow, 500)
  },
  beforeDestroy () {
    this.removeMapEvents(this.map)
  },
  computed: {
    map () {
      return this.$store.state.map.mapObject
    },
    leftDrawerSize () {
      return this.$store.state.layout.leftDrawerSize
    },
    sidebarVisible () {
      return this.$store.state.layout.sidebarVisible
    },
    currentLayer () {
      return this.$store.state.dataLayer.current
    },
    layerInfo () {
      return this.$store.state.dataLayer.layerConfig.layerInfo || null
    },
    fields () {
      return this.$store.getters['dataLayer/tableFields']
    },
    features () {
      return this.$store.state.dataLayer.table.features
    },
    selected () {
      return this.$store.state.dataLayer.table.selected
    },
    editing () {
      return this.$store.getters['dataLayer/editing']
    },
    adding () {
      return this.$store.state.dataLayer.editStatus.adding
    },
    paginationInfo () {
      const layerInfo = this.$store.state.dataLayer.layerConfig.layerInfo
      return layerInfo && layerInfo.pagination
    },
    rowsPerPageOptions () {
      let max = this.paginationInfo && this.paginationInfo.max_page_size
      if (typeof max !== 'number') {
        max = 1000
      }
      const result = rowsPerPageBase.filter(i => i < max)
      result.push(max)
      return result
    },
    columns () {
      const columns = this.fields.map(field => ({
        name: field.name,
        label: field.label,
        align: 'left',
        required: true,
        sortable: true
      }))

      if (this.editing) {
        columns.unshift({
          name: '__actions',
          required: false,
          label: Vue.filter('capitalize')(this.$t('names.actions')),
          align: 'left',
          field: () => '',
          sortable: false
        })
      }

      return columns
    }
  },
  watch: {
    map: {
      handler (newValue, oldValue) {
        this.addMapEvents(newValue)
        this.removeMapEvents(oldValue)
        if (this.mapFilter) {
          this.refreshDataNow()
        }
      },
      immediate: true
    },
    currentLayer () {
      this.loadLayerInfo()
    },
    mapFilter () {
      this.refreshDataNow()
    },
    polygonFilter () {
      this.refreshDataNow()
    },
    leftDrawerSize () {
      this.checkBbox()
    },
    sidebarVisible () {
      this.checkBbox()
    }
  },
  methods: {
    t (key, args) {
      return this.$t('tools.data.' + key, args)
    },
    addMapEvents (map) {
      if (map) {
        map.on('move', this.checkBbox)
        map.on('zoom', this.checkBbox)
      }
    },
    removeMapEvents (map) {
      if (map) {
        map.off('move', this.checkBbox)
        map.off('zoom', this.checkBbox)
      }
    },
    refreshDataNow () {
      if (!this.$refs.table) {
        // Cannot refreh yet
      } else if (this.loading) {
        // If loading, delay more
        this.refreshData()
      } else {
        this.$refs.table.requestServerInteraction()
      }
    },
    checkBbox () {
      if (this.mapFilter && !this.editing) {
        const newBbox = this.$store.getters['map/drfgBbox']()
        if (!isEqual(newBbox, this.bbox)) {
          this.bbox = newBbox
          this.refreshData()
        }
      }
    },
    onRequest ({ pagination, filter, getCellValue }) {
      const layerInfo = this.$store.state.dataLayer.layerConfig.layerInfo
      const current = this.$store.state.dataLayer.current
      if (!layerInfo || !current) {
        return
      }

      if (this.editing) {
        return
      }

      this.loading = true

      const args = {
        source: current.source,
        layer: current.layer,
        pagination,
        filter,
        colFilters: {},
        extraParams: {}
      }

      this.fields.forEach(f => {
        if (f.geom) {
          return
        }

        const value = this.colFilters[f.name]
        if (value) {
          const s = f.search(value)
          args.colFilters[s.key] = s.value
        }
      })

      if (this.mapFilter && this.bbox) {
        args.extraParams.in_bbox = this.bbox.join(',')
      }

      if (this.polygonFilter) {
        args.extraParams.intersects = this.polygonFilter
      }

      databaseLayersApi.getData(args, this.$store.getters['auth/config'])
        .then(response => {
          const data = response.data

          this.pagination = pagination
          this.pagination.rowsNumber = data.count
          this.pagination.page = data.page
          this.pagination.rowsPerPage = data.page_size

          const features = data.features

          const selectedPks = this.$store.state.dataLayer.table.selected.map(feature => feature.id)

          features.forEach(feature => {
            const onEdit = () => {
              this.$store.dispatch('dataLayer/editGeometry', feature)
            }
            addFeatureMixin(feature, selectedPks.includes(feature.id), 'id', onEdit)
          })
          this.$store.dispatch('dataLayer/setFeatures', features)
          this.loading = false
        })
        .catch(error => {
          this.loading = false
          this.$except(error)
        })
    },
    onColFilterInput (col, value) {
      this.$set(this.colFilters, col.name, value)
      this.refreshData()
    },
    changePage (page) {
      this.$refs.vuetable.changePage(page)
    },
    refreshGeojson () {
      this.$store.dispatch('dataLayer/refreshGeojson')
    },
    onSelected (selected) {
      const pks = selected.map(row => row.id)
      this.features.forEach(feature => {
        feature.status.selected = pks.includes(feature.id)
      })
      this.$store.commit('dataLayer/selected', selected)
      this.refreshGeojson()
    },
    popupToggleSelect ({ feature, value }) {
      this.$store.commit('dataLayer/valueSelection', { feature, value })
    },
    popupDelete (feature) {
      feature.status.deleted = !feature.status.deleted
    },
    loadLayerInfo () {
      if (!this.$store.state.dataLayer.current) {
        console.warn('No current layer')
        return
      }

      const source = this.$store.state.dataLayer.current.source
      const layer = this.$store.state.dataLayer.current.layer
      databaseLayersApi.getLayerInfo(source, layer, this.$store.getters['auth/config'])
        .then(response => {
          this.$store.commit('dataLayer/layerInfoFromRequest', response.data)
          this.processLayerInfo()
          this.$nextTick(() => this.refreshDataNow())
        })
        .catch(this.$except)
    },
    getRowsPerPage () {
      const layerInfo = this.$store.state.dataLayer.layerConfig.layerInfo
      const paginationInfo = layerInfo && layerInfo.pagination
      const rowsPerPage = paginationInfo && paginationInfo.page_size
      if (typeof rowsPerPage !== 'number') {
        return null
      }
      return rowsPerPage
    },
    processLayerInfo () {
      const rowsPerPage = this.getRowsPerPage()
      if (rowsPerPage !== null) {
        this.pagination.rowsPerPage = rowsPerPage
      }

      const options = makeGeoJsonOptions(this.layerInfo, {
        parent: this,
        map: this.map,
        popup: {
          component: MapPopup,
          onEachPopup: ({ container, content }) => {
            content.$on('select', this.popupToggleSelect)
            content.$on('edit', value => this.$emit('edit', value))
            content.$on('delete', this.popupDelete)
          },
          openCondition: () => !this.adding
        },
        modStyle: (style, feature) => {
          const result = { ...style }

          if (feature.status.deleted) {
            result['fillColor'] = '#ff9898'
          } else if (feature.status.selected) {
            result['fillColor'] = '#a0cfff'
          } else if (feature.status.new) {
            result['fillColor'] = '#bbb'
          }

          return result
        },
        afterEachSelect: ({ feature, layer }) => setupLayer(feature, layer, this.editing)
      })

      this.$store.commit('dataLayer/layerOptions', options)
    },
    pkValue (value) {
      if (typeof value === 'string' && value.startsWith('__new')) {
        return `(${this.$t('states.new')})`
      } else {
        return value
      }
    },
    _recalculateSelected () {
      this.selected = this.features.filter(feature => feature.status.selected)
    }
  }
}
</script>

<style lang="scss">
.data-table {
  background-color: #fff;

  .data-table-row .q-img {
    max-height: 40px;
  }
}

.q-table th.actions {
  width: 1px;
}
</style>

<style lang="stylus">
.q-table tbody tr.deleted
  background-color $red-5

.q-table tbody tr.deleted.selected
  background-color $red-4

.q-table tbody tr.deleted:hover
  background-color $red-3
</style>
