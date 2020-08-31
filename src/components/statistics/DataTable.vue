<template>
  <q-table
    v-if="data"
    class="limit-parent"
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
    <template v-slot:top-right>
      <q-btn-group class="no-shadow">
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
    </template>
    <template v-slot:top-left>
      <q-input borderless dense v-model="filter" :placeholder="$t('actions.search') | capitalize">
        <template v-slot:append>
          <q-icon name="search"></q-icon>
        </template>
      </q-input>
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
import DataCell from 'src/lib/field/components/DataCell'

import ColumnFilter from './ColumnFilter'

async function computeData () {
  await this.$nextTick()
  this.computeData()
}
function debounceComputeData () {
  this.loading = true
  this.debounceComputeData()
}

function wrapCsvValue (val, formatFn) {
  let formatted = formatFn !== void 0
    ? formatFn(val)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}

export default {
  props: ['value'],
  components: {
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
      loading: false,
      pagination: {
        sortBy: null,
        descending: false,
        rowsPerPage: 0
      },
      data: []
    }
  },
  watch: {
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
      return this.fields.map(field => ({
        name: field.name,
        label: this.$filter('capitalize')(field.name),
        field: row => field.getValue({ from: row }),
        sortable: true,
        internalField: field
      }))
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
    _computeData () {
      if (!this.value) {
        this.data = null
        return
      }

      let rows = this.value.filter(row => {
        const data = { from: row }
        let result = true
        result = result && (!this.filter || some(this.fields, field => {
          return field.filter(data, this.filter)
        }))
        result = result && every(this.fields, field => {
          const colFilter = this.colFilters[field.name]
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
    }
  }
}
</script>
