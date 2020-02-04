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
import { QIcon, QInput, QTable, QTd, QTh } from 'quasar'

import { every, some } from 'src/lib/itertools'
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

export default {
  props: ['value'],
  components: {
    ColumnFilter,
    DataCell,
    QIcon,
    QInput,
    QTable,
    QTd,
    QTh
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
      filter: '',
      colFilters: {},
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
    }
  },
  computed: {
    fields () {
      return this.$store.state.statistics.aggregatedFields
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
        return result
      })

      Object.freeze(rows)
      this.$emit('filtered', rows)
      this.data = rows
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
