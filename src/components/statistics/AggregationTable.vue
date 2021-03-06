<template>
  <q-table
    v-if="by"
    :data="by"
    :columns="columns"
    row-key="name"
    virtual-scroll
    :pagination="{ rowsPerPage: 0 }"
    :rows-per-page-options="[0]"
  >
    <template v-slot:body-cell-__internal__colorColumn="{ value }">
      <td class="aggregation-table__color" :style="{ 'background-color': value }"><span class="contrast">{{ value }}</span></td>
    </template>
  </q-table>
</template>

<script>
import { QTable } from 'quasar'
import { mapState } from 'vuex'

export default {
  components: {
    QTable
  },
  data () {
    return {
      table: null,
      dataColumns: []
    }
  },
  computed: {
    ...mapState('statistics', ['by', 'aggregation', 'result', 'colorMap']),
    aggregationColumns () {
      if (!this.result) {
        return []
      }
      return [
        {
          name: '__internal__agg__count',
          label: this.t('columnCount'),
          field: row => {
            const r = this.result && this.result.get(row)
            return r ? r.count : 0
          }
        }
      ]
    },
    columns () {
      return [
        ...this.dataColumns,
        ...this.aggregationColumns,
        {
          name: '__internal__colorColumn',
          label: this.t('columnColor'),
          field: row => this.colorMap.get(row) || this.colorMap.get('default')
        }
      ]
    }
  },
  watch: {
    by: {
      handler: 'computeDataColumn',
      immediate: true
    }
  },
  methods: {
    computeDataColumn (data) {
      const keySet = new Set()
      const dataColumns = []
      data && data.forEach(row => {
        for (let key in row.feature.properties) {
          if (!keySet.has(key)) {
            keySet.add(key)
            dataColumns.push({
              name: key,
              label: this.$filter('capitalize')(key),
              field: row => row.feature.properties[key],
              align: 'left'
            })
          }
        }
      })

      // Do not remake the columns if they are the same (avoids unnecessary reactivity of the table)
      if (this.dataColumns.length !== dataColumns.length || !this.dataColumns.every(column => keySet.has(column.name))) {
        this.dataColumns = dataColumns
      }
    },
    t (key) {
      return this.$t('tools.statistics.' + key)
    }
  }
}
</script>

<style>
.aggregation-table__color {
  text-align: right;
}

.contrast {
  color: black;
}
@supports (filter: invert(1) grayscale(1) contrast(1000)) and ((background-clip: text) or (-webkit-background-clip: text)) {
  /* Color white or black depending of the color on the background */
  .contrast {
    background: inherit;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: invert(1) grayscale(1) contrast(1000);
  }
}

.leaflet-tooltip.statistics-result {
  background: none;
  box-shadow: none;
  border: none;
}
@supports (filter: invert(1) grayscale(1) contrast(1000)) {
  .invert-text {
    filter: invert(1) grayscale(1) contrast(1000);
  }
}
@supports (not (filter: invert(1) grayscale(1) contrast(1000))) {
  .invert-text {
    color: black !important;
  }
}
</style>
