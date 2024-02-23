<template>
<div>
  <q-table
    v-if="legend && legend.length > 0"
    :title="$t('names.legend') | capitalize"
    :data="legend"
    :columns="columns"
    hide-bottom
    :pagination="{
        sortBy: 'desc',
        descending: false,
        rowsPerPage: 10
      }"
    class="q-mt-md"
  >
    <template v-slot:body-cell-color="{ value }">
      <td :style="{ 'background-color': value }"><span class="contrast">{{ value }}</span></td>
    </template>
  </q-table>
</div>
</template>

<script>
import { QTable } from 'quasar'

export default {
  components: {
    QTable
  },
  beforeDestroy () {
    this.$store.commit('statistics/legend', null)
  },
  data () {
    return {
      columns: [
        { name: 'color', label: this.t('columnColor'), field: 'color', sortable: true, align: 'left' },
        { name: 'minValue', label: `${this.t('columnCount')} Min`, field: 'minValue', sortable: true },
        { name: 'maxValue', label: `${this.t('columnCount')} Max`, field: 'maxValue', sortable: true }
      ]
    }
  },
  computed: {
    by () {
      return this.$store.state.statistics.by
    },
    legend () {
      return this.$store.state.statistics.legend
    }
  },
  methods: {
    t (key) {
      return this.$t('tools.statistics.' + key)
    }
  },
  watch: {
    by (val) {
      if (val === null) {
        this.$store.commit('statistics/legend', null)
      }
    }
  }
}
</script>

<style>

</style>
