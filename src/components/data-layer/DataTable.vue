<template>
  <q-table
    class="column no-wrap"
    table-class="data-table col"
    :columns="columns"
    :data="table.rows"
    row-key="internalPk"
    binary-state-sort
    :loading="table.remote.working"
    selection="multiple"
    :selected="selected"
    :pagination="table.remote.pagination"
    :rows-per-page-options="rowsPerPageOptions"
    :hide-bottom="table.editing"
    @selection="onSelect"
    @request="onRequest"
  >
    <!-- Headers -->
    <template
      v-slot:header-cell="props"
    >
      <q-th
        :props="props"
        :class="{ actions: props.col.name === '__actions' }"
      >
        {{ props.col.label }}
        <q-btn
          v-if="props.col.searchable"
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
                  :readonly="table.editing"
                  :label="t('colFilter', {label: props.col.label})"
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

    <!-- data row -->
    <template
      v-slot:body="props"
    >
      <q-tr
        :props="props"
        class="data-table-row"
        :class="{ deleted: props.row.status.deleted }"
      >
        <q-td auto-width>
          <q-checkbox color="primary" v-model="props.row.status.selected" />
        </q-td>
        <q-td v-if="table.editing">
          <custom-actions
            :row="props.row"
          />
        </q-td>
        <data-cell
          v-for="field in table.tableFields"
          :key="props.row + '-' + field.name"
          :table="table"
          :row="props.row"
          :field="field"
        />
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import Vue from 'vue'
import { QBtn, QCard, QCardSection, QCheckbox, QIcon, QInput, QMenu, QTable, QTd, QTh, QTr } from 'quasar'

import TranslationMixin from './TranslationMixin'

import DataCell from 'src/lib/field/components/DataCell'
import CustomActions from './CustomActions'

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
  mixins: [TranslationMixin],
  props: ['table'],
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
  computed: {
    filters () {
      return this.table.remote.filters
    },
    colFilters () {
      return this.filters.columns
    },
    columns () {
      const columns = this.table.tableFields.map(field => {
        return ({
          name: field.name,
          label: field.label,
          align: 'left',
          sortable: !field.virtual && !field.constant,
          searchable: field.search && !field.virtual && !field.constant
        })
      })

      if (this.table.editing) {
        columns.unshift({
          name: '__actions',
          label: Vue.filter('capitalize')(this.$t('names.actions')),
          align: 'left',
          field: () => '',
          sortable: false
        })
      }

      return columns
    },
    rowsPerPageOptions () {
      const max = this.table.info.maxPageSize
      const result = rowsPerPageBase.filter(i => i < max)
      result.push(max)
      return result
    },
    selected () {
      return this.table.rows.filter(row => this.table.selectedList.includes(row.internalPk))
    }
  },
  watch: {
    filters: {
      handler () {
        this.table.remote.pagination.page = 1
        this.table.update()
      },
      deep: true
    }
  },
  methods: {
    onColFilterInput (key, value) {
      if (value) {
        Vue.set(this.colFilters, key, value)
      } else {
        Vue.delete(this.colFilters, key)
      }
    },
    onRequest ({ pagination }) {
      this.table.update({ pagination })
    },
    onSelect ({ keys, rows, added }) {
      this.table.select(rows.map(row => row.internalPk), { added })
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

.q-btn.pushed
  background-color $primary !important
  border-color $primary !important
  color white !important
</style>
