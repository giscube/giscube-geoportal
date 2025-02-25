<template>
  <q-table
    v-if="data"
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
    @request="onRequest"
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
            @click="toggleFilterPolygon"
          >
            <q-tooltip v-if="isDrawing">Stop drawing</q-tooltip>
            <q-tooltip v-if="!filterPolygon">Filter by polygon</q-tooltip>
            <q-tooltip v-else>Remove polygon filter</q-tooltip>
          </q-btn>
          <q-btn
            flat
            icon-right="save_alt"
            no-caps
            @click="exportTable"
          >
            <q-tooltip>Export to csv</q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>
    </template>
    <template v-slot:header-cell="props">
      <q-th :props="props">
        {{ props.col.label }}
        <column-filter
          v-model="colFilters[props.col.name]"
          :field="props.col.internalField"
          :label="props.col.label"
        />
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
</template>

<script>
import debounce from 'lodash/debounce.js'
import { QBtn, QBtnGroup, QIcon, QInput, QTable, QTd, QTh, QTooltip, exportFile } from 'quasar'

import { every, some } from 'src/lib/itertools'
import { layerInGeom } from 'src/lib/layersInGeom'
import { wrapCsvValue } from 'src/lib/fileutils.js'
import DataCell from 'src/lib/field/components/DataCell'
import QueryBuilderDialog from 'src/components/data-layer/QueryBuilderDialog'

import ColumnFilter from './ColumnFilter'

async function computeData () {
  await this.$nextTick()
  this.computeData()
}
function debounceComputeData () {
  this.loading = true
  this.debounceComputeData()
}

export default {
  props: ['value', 'filteredFields'],
  components: {
    QueryBuilderDialog,
    ColumnFilter,
    DataCell,
    QBtn,
    QBtnGroup,
    QIcon,
    QInput,
    QTable,
    QTd,
    QTh,
    QTooltip
  },
  created () {
    this.computeData = () => {
      this._computeData()
      this.loading = false
    }
    this.debounceComputeData = debounce(this.computeData, 300)
  },
  data () {
    return {
      advancedOption: null,
      loading: false,
      pagination: {
        sortBy: null,
        descending: false,
        rowsPerPage: 0
      },
      data: [],
      filterValues: [],
      showAdvancedSearchPanel: false
    }
  },
  watch: {
    advancedOption: {
      handler: 'updateFilters',
      immediate: true
    },
    value: {
      handler: computeData,
      immediate: true
    },
    fields: computeData,
    filter: debounceComputeData,
    colFilters: {
      handler: debounceComputeData,
      deep: true
    },
    filterPolygon: debounceComputeData
  },
  computed: {
    filter: {
      set (value) {
        this.$store.commit('statistics/filter', value)
      },
      get () {
        return this.$store.state.statistics.filter
      }
    },
    colFilters: {
      set (value) {
        this.$store.commit('statistics/colFilters', value)
      },
      get () {
        return this.$store.state.statistics.colFilters
      }
    },
    isDrawing () {
      return this.$store.state.root.currentTool === 'draw'
    },
    fields () {
      return this.$store.state.statistics.aggregatedFields
    },
    filterPolygon () {
      return this.$store.state.statistics.filterPolygon
    },
    columns () {
      let listColumns = this.fields.map(field => ({
        name: field.name,
        label: this.$filter('capitalize')(field.name),
        field: row => field.getValue({ from: row }),
        align: 'left',
        sortable: true,
        internalField: field
      }))
      if (this.filteredFields) {
        let listFilteredColumns = []
        this.filteredFields.forEach(name => {
          const column = listColumns.find(col => col.name === name)
          if (column) {
            listFilteredColumns.push(column)
          }
        })
        return listFilteredColumns
      }
      return listColumns
    }
  },
  methods: {
    clearFilter () {
      this.$store.dispatch('statistics/clearFilters')
    },
    onRequest ({ pagination }) {
      this.pagination.sortBy = pagination.sortBy
      this.pagination.descending = pagination.descending
    },
    parseListFilter (value) {
      if (typeof value !== 'string') return null

      const values = value.split(/\s+AND\s+|\s+and\s+/i).filter(Boolean)
      const regex = /^\s*["']?([\w.]+)["']?\s*(>=|<=|>|<|=|CONTAINS|LIKE|EXACT)\s*["']?(.*?)["']?\s*$/i
      const listFilter = []
      values.forEach(val => {
        const dictFilter = this.parseFilter(val, regex)
        if (dictFilter) {
          listFilter.push(dictFilter)
        }
      })
      return listFilter
    },
    parseFilter (value, customRegex = null) {
      if (typeof value !== 'string') return null

      let regex = /^\s*(>=|<=|>|<|=|CONTAINS|LIKE|EXACT)\s+["']?(.*?)["']?$/i
      if (customRegex) {
        regex = customRegex
      }
      const match = value.match(regex)

      if (match) {
        if (customRegex) {
          let [, field, operator, val] = match
          field = field.toLowerCase().trim()
          operator = operator.toUpperCase()
          val = val.toLowerCase().trim()
          return { field, operator, val }
        } else {
          let [, operator, val] = match
          operator = operator.toUpperCase()
          val = val.toLowerCase().trim()
          return { operator, val }
        }
      }

      return null
    },
    _computeData () {
      if (!this.value) {
        this.data = null
        return
      }

      let rows = this.value.filter(row => {
        const data = { from: row }
        let result = true
        result = result && (!this.filter || some(this.fields, field => {
          const listFilter = this.parseListFilter(this.filter)
          if (listFilter.length > 0) {
            return field.compareListFilter(data, listFilter)
          }
          return field.filter(data, this.filter)
        }))
        result = result && every(this.fields, field => {
          const colFilter = this.colFilters[field.name]
          const dictFilter = this.parseFilter(colFilter)
          if (dictFilter) {
            return field.compareFilter(data, dictFilter)
          }
          return field.colFilter(data, colFilter)
        })
        result = result && (!this.filterPolygon || layerInGeom(row, this.filterPolygon))
        return result
      })

      Object.freeze(rows)
      this.$emit('filtered', rows)
      this.data = rows
    },
    exportTable () {
      // naive encoding to csv format
      const content = [ this.columns.map(col => wrapCsvValue(col.label)) ].concat(
        this.data.map(row => this.columns.map(col => wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            : row[col.field === void 0 ? col.name : col.field],
          col.format
        )).join(','))
      ).join('\r\n')

      const status = exportFile(
        'table-export.csv',
        content,
        'text/csv'
      )

      if (status !== true) {
        this.$q.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    toggleFilterPolygon () {
      if (this.isDrawing) {
        this.$store.dispatch('map/stopDrawing')
      } else {
        this.$store.dispatch('statistics/toggleFilterPolygon')
      }
    },
    sort (rows, sortBy, descending) {
      const sortByField = sortBy && this.fields.find(field => field.name === sortBy)
      if (sortByField) {
        rows = rows.sort((a, b) => sortByField.compare({ from: a }, { from: b }, descending))
      }
      return rows
    },
    updateFilters () {
      this.filter = this.advancedOption
    },
    getFieldValues (field) {
      if (field?.name) {
        this.filterValues = [...new Set(
          this.value.map(row => {
            if (row.feature.properties[field.name]) {
              return row.feature.properties[field.name]
            }
          })
        )].sort()
      } else {
        this.filterValues = []
      }
    }
  }
}
</script>

<style scoped>
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
</style>
