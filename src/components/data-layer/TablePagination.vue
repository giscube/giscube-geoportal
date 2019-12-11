<template>
  <div class="table-pagination q-px-sm" :disabled="disable">
    <div class="row items-centred justify-end">
      <div class="row no-wrap items-centred">
        {{ t('recordsPerPage') }}
        <q-select
          dense
          borderless
          class="q-ml-sm"
          :disable="disable"
          :options="options"
          :value="value.rowsPerPage"
          :display-value="value.rowsPerPage === 0 ? $q.lang.table.allRows : value.rowsPerPage"
          @input="$emit('input', {
            ...value,
            rowsPerPage: $event,
            page: 1
          })"
        />
      </div>
      <div class="row no-wrap items-centred">
        {{ $q.lang.table.pagination(first, last, value.rowsNumber) }}
        <q-btn
          flat
          dense
          round
          :disable="disable || !hasPrev"
          :icon="$q.iconSet.table.prevPage"
          @click="$emit('input', {
            ...value,
            page: value.page - 1
          })"
        />
        <q-btn
          flat
          dense
          round
          :disable="disable || !hasNext"
          :icon="$q.iconSet.table.nextPage"
          @click="$emit('input', {
            ...value,
            page: value.page + 1
          })"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { QBtn, QSelect } from 'quasar'
import { pageSizes } from 'src/lib/table/Remote'

import TranslationMixin from './TranslationMixin'

export default {
  mixins: [TranslationMixin],
  props: {
    value: {
      type: Object,
      required: true
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  components: {
    QBtn,
    QSelect
  },
  computed: {
    options () {
      return pageSizes
    },
    preFirst () {
      return (this.value.page - 1) * this.value.rowsPerPage + 1
    },
    first () {
      return Math.min(this.value.rowsNumber, this.preFirst)
    },
    vLast () {
      return this.value.page * this.value.rowsPerPage
    },
    last () {
      return Math.min(this.value.rowsNumber, this.vLast)
    },
    hasPrev () {
      return this.value.page > 1
    },
    hasNext () {
      return this.vLast < this.value.rowsNumber
    }
  }
}
</script>
<style lang="stylus">
.table-pagination
  font-size: 0.9em
  border: 1px solid $table-border-color
  > :first-child
    margin-right: -($spaces.sm.x)
    > *
      margin-right: $spaces.sm.x
</style>
