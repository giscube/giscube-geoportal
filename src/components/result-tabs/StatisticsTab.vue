<template>
  <div>
    <file-select
      class="q-mb-md"
      :value="byOption"
      :options="byOptions"
      accept="application/geo+json,.json,.geojson"
      :label="t('groupBy')"
      @input="setBy"
    >
      <template v-slot:addBtn>
        <q-btn
          flat
          icon="close"
          v-show="by"
          @click="deleteStatsSelection"
          @click.stop="value = null"
        />
      </template>
    </file-select>
    <label-select
      :value.sync="keyLabel"
      :byOptions="by"
    />
    <q-circular-progress
      v-if="progressTotal > 0"
      :value="progress"
      :max="progressTotal"
      show-value
      size="50px"
    />
    <palette-select
      v-else
      :scheme.sync="paletteScheme"
      :groups.sync="paletteGroups"
    />
    <statistics-legend />
    <aggregation-table class="q-mt-md" style="min-height: 150px" />
  </div>
</template>

<script>
import { delay } from 'src/lib/utils'
import { mapState } from 'vuex'
import { QBtn, QCircularProgress } from 'quasar'

import AggregationTable from '../statistics/AggregationTable'
import FileSelect from '../FileSelect'
import LabelSelect from '../statistics/LabelSelect'
import PaletteSelect from '../statistics/PaletteSelect'
import PolygonTooltip from '../statistics/PolygonTooltip'
import StatisticsLegend from '../statistics/StatisticsLegend'

export default {
  props: ['result', 'legend', 'keywords'],
  components: {
    QBtn,
    QCircularProgress,
    AggregationTable,
    FileSelect,
    LabelSelect,
    PaletteSelect,
    StatisticsLegend
  },
  computed: {
    ...mapState('statistics', ['by', 'byOption', 'byLayer']),
    ...mapState('statistics', {
      progress: state => state.processes.loading.current,
      progressTotal: state => state.processes.loading.total
    }),
    paletteScheme: {
      get () {
        return this.$store.state.statistics && this.$store.state.statistics.palette && this.$store.state.statistics.palette.scheme
      },
      set (value) {
        this.$store.dispatch('statistics/setPaletteScheme', value)
      }
    },
    paletteGroups: {
      get () {
        return this.$store.state.statistics && this.$store.state.statistics.palette && this.$store.state.statistics.palette.groups
      },
      set (value) {
        this.$store.dispatch('statistics/setPaletteGroups', value)
      }
    },
    keyLabel: {
      get () {
        return this.$store.state.statistics && this.$store.state.statistics.keyLabel
      },
      set (value) {
        this.$store.dispatch('statistics/setKeyLabel', value)
      }
    },
    byOptions () {
      return this.$config.tools.statistics && this.$config.tools.statistics.groups
    }
  },
  methods: {
    deleteStatsSelection () {
      this.$store.commit('statistics/byOption', null)
      this.$store.commit('statistics/by', null)
      this.$store.dispatch('statistics/aggregate')
    },
    async setBy (option) {
      const tooltip = { parent: this, Component: PolygonTooltip }
      this.$store.dispatch('statistics/selectBy', { option, tooltip })
      await delay()
      this.$store.dispatch('statistics/aggregate')
    },
    t (key, ...args) {
      return this.$t('tools.statistics.' + key, ...args)
    }
  }
}
</script>
