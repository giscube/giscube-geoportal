<template>
  <div class="column no-wrap" style="min-height: 300px">
    <q-table
      class="limit-parent sticky-header"
      dense
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      :loading="loading"
      :sort-method="sort"
      binary-state-sort
      virtual-scroll
      @request="onPaginationChange"
    >
      <template v-slot:top>
        <div class="row full-width justify-between items-center">
          <q-input
            class="col"
            autogrow
            outlined
            dense
            v-model="filter"
            :placeholder="$t('actions.search') | capitalize"
          >
            <template v-slot:append>
              <q-icon name="close" @click="filter = ''" class="cursor-pointer"></q-icon>
            </template>
          </q-input>
          <q-btn-group class="no-shadow q-ml-md">
            <q-btn
              flat
              icon-right="functions"
              @click="showAdvancedSearchPanel = true"
            >
              <q-tooltip> {{ $t('tools.search.queryBuilder.title') }} </q-tooltip>
                <query-builder-dialog
                  :fields="columns"
                  :values="filterValues"
                  :advancedOption.sync="advancedOption"
                  :show.sync="showAdvancedSearchPanel"
                  @get-field-values="getFieldValues"
                />
            </q-btn>
            <q-btn
              flat
              icon-right="mdi-filter-remove-outline"
              no-caps
              @click="clearFilter"
            >
              <q-tooltip>Clear filters</q-tooltip>
            </q-btn>
            <q-btn
              flat
              :icon-right="isDrawing ? 'pause' : filterPolygon ? 'fas fa-times' : 'fas fa-draw-polygon'"
              no-caps
              :class="{ pushed: polygonFilter }"
              @click="toggleFilterPolygon"
            >
              <q-tooltip v-if="isDrawing">Stop drawing</q-tooltip>
              <q-tooltip v-if="!filterPolygon">Filter by polygon</q-tooltip>
              <q-tooltip v-else>Remove polygon filter</q-tooltip>
            </q-btn>
          </q-btn-group>
        </div>
      </template>
      <template v-slot:header-cell="props">
        <q-th :props="props">
          {{ props.col.label }}
          <q-btn
            flat
            dense
            size="sm"
            class="q-mx-xs"
            :icon="colFilters[props.col.name] ? 'mdi-filter' : 'mdi-filter-outline'"
            @click.stop=""
          >
            <q-menu>
              <q-card>
                <q-card-section>
                  <q-input
                    autofocus
                    :readonly="table.editing"
                    :label="t('colFilter', { label: $filter('capitalize')(props.col.label) })"
                    :value="colFilters[props.col.name] || ''"
                    @input="onColFilterInput(props.col.name, $event)"
                  >
                    <template
                      v-slot:append
                      v-if="!table.editing && colFilters[props.col.name]"
                    >
                      <q-icon name="close" @click.stop="onColFilterInput(props.col.name, '')" class="cursor-pointer" />
                    </template>
                  </q-input>
                </q-card-section>
              </q-card>
            </q-menu>
          </q-btn>
        </q-th>
      </template>
    <template v-slot:body-cell="props">
      <q-td :props="props">
        <data-cell
          :data="{ from: props.row }"
          :field="props.col.internalField"
        />
      </q-td>
    </template>
    </q-table>
  </div>
</template>

<script>
import { QCard, QCardSection, QBtn, QBtnGroup, QIcon, QInput, QMenu, QTable, QTh, QTd, QTooltip } from 'quasar'
import Vue from 'vue'

import DataCell from 'src/lib/field/components/DataCell'
import QueryBuilderDialog from './QueryBuilderDialog'
import TranslationMixin from './TranslationMixin'

const diff = 10
const extra = diff + 2

const rowHeight = 54 // from quasar style (it's hardcoded)

export default {
  mixins: [TranslationMixin],
  props: ['table'],
  components: {
    DataCell,
    QueryBuilderDialog,
    QCard,
    QCardSection,
    QBtn,
    QBtnGroup,
    QIcon,
    QInput,
    QMenu,
    QTable,
    QTh,
    QTd,
    QTooltip
  },
  data () {
    return {
      advancedOption: null,
      current: 0,
      data: [],
      nRows: 20,
      filterValues: [],
      loading: false,
      showAdvancedSearchPanel: false
    }
  },
  mounted () {
    if (!this.$store.state.dataLayer.table) {
      this.$store.state.dataLayer.table = this.table
    }
  },
  computed: {
    allSelected () {
      let some = false
      let all = this.rows.length > 0
      this.rows.forEach(row => {
        some = some || row.status.selected
        all = all && row.status.selected
      })

      return all || (some && null)
    },
    bottomSpace () {
      return (this.rows.length - this.range.end) * rowHeight
    },
    colFilters: {
      get () {
        return this.filters.columns
      },
      set (value) {
        this.filters.columns = value
      }
    },
    columns () {
      let listColumns = this.fields.map(field => ({
        name: field.name,
        label: this.$filter('capitalize')(field.label),
        field: row => field.getValue({ from: row }),
        align: 'left',
        sortable: true,
        internalField: field
      }))
      return listColumns
    },
    fields () {
      return this.table.info.tableFields
    },
    filters () {
      return this.table.remote.filters
    },
    filter: {
      get () {
        return this.table.remote.filters.general || ''
      },
      set (value) {
        this.table.remote.filters.general = value
      }
    },
    pagination: {
      get () {
        return this.table.remote.pagination
      },
      set (value) {
        Vue.set(this.table.remote, 'pagination', value)
      }
    },
    polygonFilter () {
      return !!this.table.remote.filters.polygon
    },
    rows () {
      return this.table.rows
    },
    visibleData () {
      return this.rows.map(row => row.properties)
    },
    range () {
      return {
        start: Math.max(0, this.current - extra),
        end: Math.min(this.rows.length, this.current + this.nRows + extra)
      }
    },
    topSpace () {
      return this.range.start * rowHeight
    },
    filterPolygon () {
      return this.$store.state.dataLayer.filterPolygon
    },
    isDrawing () {
      return this.$store.state.root.currentTool === 'draw'
    }
  },
  watch: {
    advancedOption: {
      handler: 'updateFilters',
      immediate: true
    },
    filters: {
      handler () {
        this.update()
      },
      deep: true
    },
    visibleData: {
      handler (newValue, oldValue) {
        this.data = newValue
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    clearFilter () {
      this.filter = null
      for (let key in this.colFilters) {
        if (this.colFilters.hasOwnProperty(key)) {
          this.colFilters[key] = null
        }
      }
    },
    onColFilterInput (key, value) {
      if (value) {
        if (this.colFilters[key] !== value) {
          Vue.set(this.colFilters, key, value)
          this.pagination.page = 1
        }
      } else {
        if (this.colFilters[key] !== void 0) {
          Vue.delete(this.colFilters, key)
          this.pagination.page = 1
        }
      }
    },
    onOrderBy (field) {
      if (this.table.editing) {
        return
      }

      if (this.pagination.sortBy === field) {
        if (this.pagination.descending) {
          Vue.delete(this.pagination, 'sortBy')
          Vue.delete(this.pagination, 'descending')
        } else {
          this.pagination.descending = true
        }
      } else {
        Vue.set(this.pagination, 'sortBy', field)
        Vue.set(this.pagination, 'descending', false)
      }
      this.pagination.page = 1
      this.update()
    },
    onPaginationChange (request) {
      this.pagination = request.pagination
      this.update()
    },
    onResize (size) {
      this.nRows = size.height / rowHeight
    },
    onScroll () {
      const pos = Math.floor(this.$refs.scroller.scrollTop / rowHeight)
      if (pos - this.current >= diff || this.current - pos >= diff) {
        this.current = pos
      }
    },
    select (row, value) {
      this.table.selectRows([row], { added: value })
    },
    selectAll (value) {
      this.table.selectRows(this.rows, { added: this.allSelected === false })
    },
    sort (rows, sortBy, descending) {
      const sortByField = sortBy && this.fields.find(field => field.name === sortBy)
      if (sortByField) {
        rows = rows.sort((a, b) => sortByField.compare({ from: a }, { from: b }, descending))
      }
      return rows
    },
    update (config) {
      this.table.update({ pagination: this.pagination, ...config })
        .catch(this.$except)
    },
    updateFilters () {
      this.filter = this.advancedOption
    },
    updateNow () {
      this.update({ immediate: true })
    },
    getFieldValues (field) {
      if (field?.name) {
        this.filterValues = [...new Set(
          this.table.rows.map(row => {
            if (row.properties[field.name]) {
              return row.properties[field.name]
            }
          })
        )].sort()
      } else {
        this.filterValues = []
      }
    },
    toggleFilterPolygon () {
      if (this.isDrawing) {
        this.$store.dispatch('map/stopDrawing')
      } else {
        this.$store.dispatch('dataLayer/toggleFilterPolygon')
      }
    }
  }
}
</script>

<style lang="stylus">
.sticky-header .q-table__top,
.sticky-header thead tr:first-child th {
  background-color: #fff;
}
.sticky-header thead tr th {
  position: sticky;
  z-index: 1;
}
.sticky-header thead tr:first-child th {
  top: 0;
}
.sticky-header tbody tr:not(.table-spacer) td div {
  max-height: 48px !important;
  overflow: hidden;
}
</style>
