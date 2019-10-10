<template>
  <div class="table-pagination q-px-sm">
    <div class="row items-centred justify-end">
      <div class="row no-wrap items-centred">
        {{ t('recordsPerPage') }}
        <q-select
          dense
          borderless
          class="q-ml-sm"
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
          :disabled="!hasPrev"
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
          :disabled="!hasNext"
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
    first () {
      return (this.value.page - 1) * this.value.rowsPerPage + 1
    },
    vLast () {
      return this.value.page * this.value.rowsPerPage - 1
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
