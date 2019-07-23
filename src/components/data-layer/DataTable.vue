<template>
  <div class="column no-wrap" style="min-height: 175px">
    <q-card class="full-width limit-parent column no-wrap">
      <q-resize-observer @resize="onResize" debounce="200" />
      <div
        ref="scroller"
        class="col limit-parent scroll"
        @scroll="onScroll"
      >
        <table class="q-table data-table no-scroll">
          <thead>
            <tr>
              <th><q-checkbox :value="allSelected" @input="selectAll" /></th>
              <th>{{ $t('names.actions') | capitalize }}</th>
              <th
                v-for="field in fields"
                :key="field.name"
              >
                <div
                  class="row no-wrap items-centred full-width all-pointer-events cursor-pointer"
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
          <tbody>
            <tr class="table-spacer">
              <td
                :colspan="fields.length + 2"
                :style="{
                  height: `${topSpace}px !important`
                }"
              >
                &nbsp;
              </td>
            </tr>
            <tr
              v-for="row in visibleRows"
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
                :key="row.internalPk + '__' + field.name"
              >
                <data-cell
                  :table="table"
                  :row="row"
                  :field="field"
                />
              </td>
            </tr>
            <tr class="table-spacer">
              <td
                :colspan="fields.length + 2"
                :style="{
                  height: `${bottomSpace}px !important`
                }"
              >
                &nbsp;
              </td>
            </tr>
          </tbody>
        </table>
      </div><!-- scroller -->
      <table-pagination :value="pagination" @input="onPaginationChange" />
    </q-card>
    <div class="col full-width"></div>
  </div>
</template>

<script>
import { QBtn, QCard, QCardSection, QCheckbox, QIcon, QInput, QMenu, QResizeObserver } from 'quasar'
import Vue from 'vue'

import TranslationMixin from './TranslationMixin'

import DataCell from 'src/lib/field/components/DataCell'
import CustomActions from './CustomActions'
import TablePagination from './TablePagination'

const diff = 10
const extra = diff + 2

const rowHeight = 54 // from quasar style (it's hardcoded)

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
    QResizeObserver,
    TablePagination
  },
  data () {
    return {
      current: 0,
      nRows: 20
    }
  },
  computed: {
    allSelected () {
      let some = false
      let all = true
      this.rows.forEach(row => {
        some = some || row.status.selected
        all = all && row.status.selected
      })

      return all || (some && null)
    },
    bottomSpace () {
      return (this.rows.length - this.range.end) * rowHeight
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
    visibleRows () {
      return this.rows.slice(this.range.start, this.range.end)
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
      this.update()
    },
    onOrderBy (field) {
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
  table
    overflow: auto

  div
    white-space: nowrap
    max-width: 100% !important

  thead
    th
      position: sticky
      top: 0
      background-color: white
      opacity: 1
      z-index: 1

      &:after
        content: ''
        position: absolute
        left: 0
        bottom: -1px
        width: 100%
        border-bottom: 1px solid rgba(0,0,0,0.12)

      &:first-child, &:last-child
        border-radius: $generic-border-radius

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
</style>
