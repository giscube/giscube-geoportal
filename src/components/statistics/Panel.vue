<template>
  <div class="data-panel panel fit">
    <div class="panel-content fit column no-wrap">
      <p class="panel-title">{{ aggregatedTitle ? t('titleFor', { layerName: aggregatedTitle }) : t('title') }}</p>
      <q-tabs
        v-model="tab"
        dense
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="results" :label="t('tabResults')" />
        <q-tab name="data" :label="t('tabData')" />
      </q-tabs>

        <div v-show="tab === 'results'" class="column no-wrap limit-parent">
          <file-select
            class="q-mb-md"
            :value="byOption"
            :options="byOptions"
            accept="application/geo+json,.json,.geojson"
            :label="t('groupBy')"
            @input="setBy"
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
          <aggregation-table class="q-mt-md" style="min-height: 150px" />
        </div>

        <div v-show="tab === 'data'" debounce="10" class="column no-wrap limit-parent">
          <data-table :value="aggregatedData" @filtered="setAggregated" />
        </div>
    </div>
  </div>
</template>

<script>
import { QCircularProgress, QTab, QTabs } from 'quasar'
import { mapState } from 'vuex'
import { delay } from 'src/lib/utils'

import FileSelect from '../FileSelect'
import AggregationTable from './AggregationTable'
import DataTable from './DataTable'
import PaletteSelect from './PaletteSelect'
import PolygonTooltip from './PolygonTooltip'

export default {
  components: {
    FileSelect,
    AggregationTable,
    DataTable,
    PaletteSelect,
    QCircularProgress,
    QTab,
    QTabs
  },
  beforeRouteEnter (to, from, next) {
    next(async vm => {
      await vm.$nextTick()
      if (vm.byLayer) {
        vm.byLayer.addTo(vm.mapGroup)
      }
    })
  },
  beforeRouteLeave (to, from, next) {
    if (this.byLayer) {
      this.byLayer.remove()
    }
    next()
  },
  data () {
    return {
      tab: 'results'
    }
  },
  computed: {
    ...mapState('map', ['mapGroup']),
    ...mapState('statistics', ['byOption', 'byLayer', 'aggregatedData', 'aggregatedTitle']),
    ...mapState('statistics', {
      progress: state => state.processes.loading.current,
      progressTotal: state => state.processes.loading.total
    }),
    paletteScheme: {
      get () {
        return this.$store.state.statistics.palette.scheme
      },
      set (value) {
        this.$store.dispatch('statistics/setPaletteScheme', value)
      }
    },
    paletteGroups: {
      get () {
        return this.$store.state.statistics.palette.groups
      },
      set (value) {
        this.$store.dispatch('statistics/setPaletteGroups', value)
      }
    },
    byOptions () {
      return this.$config.tools.statistics.groups
    }
  },
  methods: {
    setAggregated (data) {
      requestAnimationFrame(() => {
        this.$store.commit('statistics/aggregated', data)
        this.$store.dispatch('statistics/aggregate')
      })
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
