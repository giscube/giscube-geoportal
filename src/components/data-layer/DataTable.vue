<template>
  <q-table
    ref="table"
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
        :class="{ deleted: props.row.status.deleted }"
      >
        <q-td auto-width>
          <q-checkbox color="primary" v-model="props.selected" />
        </q-td>
        <q-td
          v-for="(col, i) in props.cols"
          :key="'col-' + i + '-row-' + props.row.id "
        >
          <custom-actions
            v-if="col.name === '__actions'"
            :row-data="props.row"
            :row-index="props.row.id"
            @edit="$emit('edit', $event)"
          />
          <div v-else-if="col.name === 'id'">{{ pkValue($refs.table && $refs.table.getCellValue(col, props.row)) }}</div>
          <div v-else>{{ $refs.table && $refs.table.getCellValue(col, props.row) }}</div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import _ from 'lodash'
import Vue from 'vue'

import L from '../../lib/leaflet'
import { addFeatureMixin, setupLayer } from '../../lib/feature.js'
import { notifyHttpError } from '../../lib/notifications.js'

import databaseLayersApi from '../../api/databaselayers.js'

import CustomActions from './CustomActions'
import MapPopup from './MapPopup'

export default {
  props: {
    filter: {
      type: String,
      default: ''
    },
    mapFilter: {
      type: Boolean,
      default: false
    }
  },
  components: {
    CustomActions
  },
  data () {
    return {
      loading: false,
      pagination: {
        rowsPerPage: 0,
        page: 1,
        rowsNumber: 0
      },
      colFilters: {}
    }
  },
  created () {
    this.recalculateSelected = _.debounce(this._recalculateSelected)
    this.refreshData = _.debounce(this.refreshDataNow, 500)
  },
  beforeDestroy () {
    if (this.map) {
      this.map.off('zoom', this.onMapChange)
      this.map.off('move', this.onMapChange)
    }
  },
  computed: {
    map () {
      return this.$store.state.map.mapObject
    },
    currentLayer () {
      return this.$store.state.dataLayer.current
    },
    layerInfo () {
      return this.$store.state.dataLayer.layerConfig.layerInfo || null
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
    columns () {
      const columns = []
      this.layerInfo && this.layerInfo.fields.forEach(f => {
        if (f.name === this.layerInfo.geom_field) {
          return
        }

        let getField = row => row.properties[f.name]
        if (f.name === 'id') {
          getField = row => row.id
        }

        const column = {
          name: f.name,
          required: true,
          label: f.label || f.name,
          field: getField,
          sortable: true // f.name !== 'id'
        }

        if (f.valuesDict) {
          column.field = row => {
            const value = getField(row)
            return value in f.valuesDict ? f.valuesDict[value] : value
          }
        }

        columns.push(column)
      })

      if (this.editing) {
        columns.push({
          name: '__actions',
          required: false,
          label: 'Actions',
          align: 'center',
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
        if (oldValue) {
          this.map.off('move', this.onMapChange)
          this.map.off('zoom', this.onMapChange)
        }
        if (newValue) {
          this.map.on('zoom', this.onMapChange)
          this.map.on('move', this.onMapChange)
        }
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
    }
  },
  methods: {
    t (key, args) {
      return this.$t('tools.data.' + key, args)
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
    onMapChange () {
      if (this.mapFilter && !this.editing) {
        this.refreshData()
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

      this.layerInfo && this.layerInfo.fields.forEach(f => {
        if (f.name === this.layerInfo.geom_field) {
          return
        }

        const value = this.colFilters[f.name]
        if (value) {
          let key = f.name
          if (f.widget === 'string') {
            key += '__icontains'
          }
          args.colFilters[key] = value
        }
      })

      if (this.mapFilter) {
        const bbox = this.$store.getters['map/bbox']()
        if (bbox) {
          args.extraParams.in_bbox = bbox.join(',')
        }
      }

      databaseLayersApi.getData(args)
        .then(response => {
          const data = response.data

          this.pagination = pagination
          this.pagination.rowsNumber = data.count
          this.pagination.page = data.page

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
          notifyHttpError(error)
          console.error(error)
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
      databaseLayersApi.getLayerInfo(source, layer)
        .then(response => {
          this.$store.commit('dataLayer/layerInfoFromRequest', response.data)
          this.processLayerInfo()
          this.refreshDataNow()
        })
    },
    processLayerInfo () {
      // TODO: shapetype, stroke_dash_array, stroke_opacity
      const options = {
        style: feature => {
          const base = {
            weight: this.layerInfo.style.stroke_width,
            color: this.layerInfo.style.stroke_color,
            opacity: 1,
            fillColor: this.layerInfo.style.fill_color,
            fillOpacity: this.layerInfo.style.fill_opacity,
            radius: this.layerInfo.style.shape_radius
          }

          if (feature.status.deleted) {
            base['fillColor'] = '#ff9898'
          } else if (feature.status.selected) {
            base['fillColor'] = '#a0cfff'
          } else if (feature.status.new) {
            base['fillColor'] = '#bbb'
          }
          return base
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', l => {
            if (this.adding) {
              return
            }

            const PopupContent = Vue.extend(MapPopup)
            const popup = new PopupContent({
              parent: this,
              propsData: {
                feature: feature
              }
            }).$mount()

            popup.$on('select', this.popupToggleSelect)
            popup.$on('edit', value => this.$emit('edit', value))
            popup.$on('delete', this.popupDelete)

            layer.bindPopup(popup.$el).openPopup()
          })

          setupLayer(feature, layer, this.editing)
        },
        pointToLayer: function (geojsonView, latlng) {
          return L.circleMarker(latlng)
        }
      }
      this.$store.commit('dataLayer/layerOptions', options)
    },
    pkValue (value) {
      if (typeof value === 'string' && value.startsWith('__new')) {
        return `(${this.$t('new')})`
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

<style>
.data-table {
  background-color: #fff;
}

.q-table th.actions {
  width: 1px;
}
</style>

<style lang="stylus">
@import '~quasar-variables'

.q-table tbody tr.deleted
  background-color $red-5

.q-table tbody tr.deleted.selected
  background-color $red-4

.q-table tbody tr.deleted:hover
  background-color $red-3
</style>
