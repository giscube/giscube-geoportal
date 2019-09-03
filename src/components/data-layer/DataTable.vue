<template>
  <div class="column no-wrap" style="min-height: 175px">
    <q-card class="full-width limit-parent column no-wrap">
      <q-virtual-scroll
        type="table"
        class="col limit-parent"
        :virtual-scroll-item-size="54"
        :virtual-scroll-sticky-size-start="60"
        :virtual-scroll-sticky-size-end="60"
        :items="rows"
      >
        <template v-slot:before>
          <thead class="tsticky text-left">
            <tr>
              <th><q-checkbox :value="allSelected" @input="selectAll" /></th>
              <th
                v-for="field in fields"
                :key="field.name"
              >
                <div
                  class="row no-wrap items-centred full-width all-pointer-events cursor-pointer"
                  :class="{
                    disabled: table.editing
                  }"
                  @click="onOrderBy(field.name)"
                >
                  {{ field.label || field.name }}
                  <q-btn
                    flat
                    dense
                    size="sm"
                    class="q-mx-xs"
                    :icon="colFilters[field.name] ? 'mdi-filter' : 'mdi-filter-outline'"
                    @click.stop=""
                  >
                    <q-menu>
                      <q-card>
                        <q-card-section>
                          <q-input
                            autofocus
                            :readonly="table.editing"
                            :label="t('colFilter', {label: (field.label || field.name)})"
                            :value="colFilters[field.name] || ''"
                            @input="onColFilterInput(field.name, $event)"
                          >
                            <template
                              v-slot:append
                              v-if="!table.editing && colFilters[field.name]"
                            >
                              <q-icon name="close" @click.stop="onColFilterInput(field.name, '')" class="cursor-pointer" />
                            </template>
                          </q-input>
                        </q-card-section>
                      </q-card>
                    </q-menu>
                  </q-btn>
                  <q-icon
                    v-show="field.name === pagination.sortBy"
                    :name="$q.iconSet.table.arrowUp"
                    size="1.3em"
                    :class="{ 'rotate-180': !pagination.descending }"
                  />
                </div>
              </th>
            </tr>
          </thead>
        </template>

        <template v-slot:after>
          <tfoot class="tsticky text-left">
            <table-pagination :value="pagination" @input="onPaginationChange" />
          </tfoot>
        </template>

        <template v-slot="{ item: row, index }">
          <tr
            :key="row.internalPk"
            :class="{
              deleted: row.status.deleted,
              selected: row.status.selected
            }"
            @click.stop="select(row, !row.status.selected)"
          >
            <td><q-checkbox :value="row.status.selected" @input="select(row, $event)" /></td>
            <td><custom-actions :row="row" /></td>
            <td
              v-for="field in fields"
              :key="row.internalPk + '_____' + field.name"
            >
              <data-cell
                :table="table"
                :row="row"
                :field="field"
              />
            </td>
          </tr>
        </template>
      </q-virtual-scroll>
    </q-card>
  </div>
</template>

<script>
import { QBtn, QCard, QCardSection, QCheckbox, QIcon, QInput, QMenu, QVirtualScroll } from 'quasar'
import Vue from 'vue'

import TranslationMixin from './TranslationMixin'

import DataCell from 'src/lib/field/components/DataCell'
import CustomActions from './CustomActions'
import TablePagination from './TablePagination'

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
    QVirtualScroll,
    TablePagination
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
    colFilters () {
      return this.filters.columns
    },
    fields () {
      return this.table.info.formFields
    },
    filters () {
      return this.table.remote.filters
    },
    pagination: {
      get () {
        return this.table.remote.pagination
      },
      set (value) {
        Vue.set(this.table.remote, 'pagination', value)
      }
    },
    rows () {
      return this.table.rows
    }
  },
  watch: {
    filters: {
      handler () {
        this.update()
      },
      deep: true
    }
  },
  methods: {
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
    onPaginationChange (pagination) {
      this.pagination = pagination
      this.update()
    },
    select (row, value) {
      this.table.selectRows([row], { added: value })
    },
    selectAll (value) {
      this.table.selectRows(this.rows, { added: this.allSelected === false })
    },
    update (config) {
      this.table.update({ pagination: this.pagination, ...config })
        .catch(this.$except)
    },
    updateNow () {
      this.update({ immediate: true })
    }
  }
}
</script>

<style lang="stylus">
.data-table
  div
    white-space: nowrap
    max-width: 100% !important

  tr > :first-child
    text-align: left
    width: 0

  // thead
  //   th
  //     position: sticky
  //     top: 0
  //     background-color: white
  //     opacity: 1
  //     z-index: 1
  //
  //     &:after
  //       content: ''
  //       position: absolute
  //       left: 0
  //       bottom: -1px
  //       width: 100%
  //       border-bottom: 1px solid rgba(0,0,0,0.12)
  //
  //     &:first-child, &:last-child
  //       border-radius: $generic-border-radius

  tbody
    will-change: contents

    .table-spacer, .table-spacer td
      margin: 0 !important
      padding: 0 !important
      line-height: 0 !important
      border: none !important

    tr.deleted
      background-color $red-5
      &.selected
        background-color $red-4
      &.deleted:hover
        background-color $red-3

    :not(.table-spacer) td div
      max-height: 48px !important

.tsticky tr > *
  position sticky
  opacity 1
  z-index 1
  background black
  color white

thead.tsticky tr:last-child > *
  top 0

tfoot.tsticky tr:first-child > *
  bottom 0
</style>
