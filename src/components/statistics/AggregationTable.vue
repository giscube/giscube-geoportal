<template>
  <q-table
    v-if="by"
    dense
    :data="by"
    :columns="columns"
    row-key="name"
    virtual-scroll
    :pagination="{ rowsPerPage: 0 }"
    :rows-per-page-options="[0]"
  >
    <template v-slot:top-right>
      <q-btn-dropdown flat icon="save_alt">
        <q-list>
          <q-item clickable v-close-popup @click="exportTable()">
            <q-item-section style="width: 140px">
              <q-item-label>{{$t('actions.download') | capitalize}} CSV</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="exportGeoJSON()">
            <q-item-section>
              <q-item-label>{{$t('actions.download') | capitalize}} GeoJSON</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </template>
    <template v-slot:body-cell-__internal__colorColumn="{ value }">
      <td class="aggregation-table__color" :style="{ 'background-color': value }"><span class="contrast">{{ value }}</span></td>
    </template>
  </q-table>
</template>

<script>
import { QBtnDropdown, QItem, QItemLabel, QItemSection, QList, QTable, exportFile } from 'quasar'
import { saveAs } from 'file-saver'
import { mapState } from 'vuex'

import { wrapCsvValue } from 'src/lib/fileutils.js'

export default {
  components: {
    QBtnDropdown, QItem, QItemLabel, QItemSection, QList, QTable
  },
  data () {
    return {
      table: null,
      dataColumns: []
    }
  },
  computed: {
    ...mapState('statistics', ['by', 'aggregation', 'result', 'colorMap', 'keyLabel']),
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
        ...this.aggregationColumns,
        {
          name: '__internal__colorColumn',
          label: this.t('columnColor'),
          field: row => this.colorMap.get(row) || this.colorMap.get('default')
        },
        ...this.dataColumns
      ]
    }
  },
  watch: {
    by: {
      handler: 'computeDataColumn',
      immediate: true
    },
    keyLabel: {
      handler: 'computeDataColumnWithKeyLabel',
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
    computeDataColumnWithKeyLabel (key) {
      const index = this.dataColumns.findIndex(item => item.name === key)
      if (index > 0) {
        const element = this.dataColumns.splice(index, 1)[0]
        this.dataColumns.unshift(element)
      }
    },
    exportGeoJSON () {
      const data = {
        type: 'FeatureCollection',
        features: this.by.map(layer => {
          let layerGeoJSON = layer.toGeoJSON()
          layerGeoJSON.properties = this.columns.reduce((prevCol, col) => {
            prevCol[col.label.toLowerCase()] = typeof col.field === 'function'
              ? col.field(layer)
              : layer[col.field === void 0 ? col.name : col.field]
            return prevCol
          }, {})
          return layerGeoJSON
        })
      }
      const dataBlob = new Blob([JSON.stringify(data)], { type: 'application/json' })
      saveAs(dataBlob, 'statistics.geojson')
    },
    exportTable () {
      // naive encoding to csv format
      const content = [ this.columns.map(col => wrapCsvValue(col.label)) ].concat(
        this.by.map(row => this.columns.map(col => wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            : row[col.field === void 0 ? col.name : col.field],
          col.format
        )).join(','))
      ).join('\r\n')

      const status = exportFile(
        'statistics-table-export.csv',
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
