<template>
  <div class="panel">
    <div class="panel-content">
      <q-toolbar>
        <q-toolbar-title>{{ $t('tools.criminal.headerName') }}</q-toolbar-title>
        <q-spinner
          v-if="loadingDataCustom"
          color="primary"
          size="2em"
        />
      </q-toolbar>
      <div class="q-pa-sm q-gutter-sm">
        <q-select
          v-model="penalCode"
          :options="penalCodeOptions"
          label="Títol Codi Penal:"
        />
        <q-select
          v-model="factType"
          :options="factTypeOptions"
          label="Tipus de fets:"
        />
        <div class="q-pt-sm">
          <p>Any: {{ year }}</p>
          <q-slider
            v-model="year"
            marker-labels
            :min="minYear"
            :max="maxYear"
            color="grey"
            track-color="grey"
            inner-track-color="transparent"
            selection-color="transparent"
            markers
          />
        </div>
        <p>{{ titleWithYear }}</p>
        <palette-select
          :scheme.sync="paletteScheme"
          :groups=groupScheme
          :groupsNotShowing="true"
        />
        <file-select
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
        <bar-chart
          :chartData="filteredData"
          :options="option"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { QSelect, QSlider, QToolbarTitle, QToolbar, QBtn, QSpinner } from 'quasar'

import FileSelect from 'components/FileSelect.vue'
import PaletteSelect from 'components/statistics/PaletteSelect.vue'
import PolygonTooltip from 'components/statistics/PolygonTooltip.js'
import BarChart from 'components/statistics/BarChart.js'

export default {
  components: {
    QSelect,
    QSlider,
    QToolbarTitle,
    QToolbar,
    QBtn,
    QSpinner,
    FileSelect,
    PaletteSelect,
    BarChart
  },
  data () {
    return {
      data: null,
      dataLoading: false,
      monthLabels: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Decembre'],
      label: 'Nombre de casos per mesos de l\'any',
      factType: null,
      penalCode: null,
      year: null,
      years: [2021, 2022],
      groupScheme: 5,
      option: {}
    }
  },
  computed: {
    ...mapState('statistics', ['by', 'byCustom', 'byOption', 'aggregatedDataCustom', 'loadingDataCustom']),
    titleWithYear () {
      let year = ''
      if (this.year) {
        year = ' (' + this.year + ')'
      }
      return (this.factType || '') + year
    },
    minYear () {
      return this.years[0]
    },
    maxYear () {
      return this.years[this.years.length - 1]
    },
    filteredData () {
      const colorList = this.paletteScheme.groups[this.groupScheme]
      const lastColor = colorList[colorList.length - 1]
      if (this.aggregatedDataCustom && this.aggregatedDataCustom.length > 0 && this.factType && this.year) {
        let filteredEvents = this.aggregatedDataCustom
          .filter(obj => {
            const date = new Date(obj.feature.properties['data_inici'])
            return (
              obj.feature.properties['tipus_fet_nivell_2'] === this.factType &&
              date.getFullYear() === this.year
            )
          })

        const monthlyCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        filteredEvents.forEach(obj => {
          const date = new Date(obj.feature.properties['data_inici'])
          const month = date.getMonth()
          monthlyCounts[month]++
        })

        return {
          labels: this.monthLabels,
          datasets: [{
            label: this.label,
            backgroundColor: lastColor,
            data: monthlyCounts
          }]
        }
      } else {
        return {
          labels: this.monthLabels,
          datasets: [{
            label: this.label,
            backgroundColor: lastColor,
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }]
        }
      }
    },
    factTypeOptions () {
      if (this.penalCode) {
        return [...new Set(this.aggregatedDataCustom
          .filter(obj => obj.feature.properties['tipus_fet_nivell_1'] === this.penalCode)
          .map(obj => obj.feature.properties['tipus_fet_nivell_2'])
        )]
      }
      return []
    },
    penalCodeOptions () {
      if (this.aggregatedDataCustom) {
        return [...new Set(this.aggregatedDataCustom.map(obj => obj.feature.properties['tipus_fet_nivell_1']))]
      }
      return []
    },
    paletteScheme: {
      get () {
        return this.$store.state.statistics && this.$store.state.statistics.palette && this.$store.state.statistics.palette.scheme
      },
      set (value) {
        this.$store.dispatch('statistics/setPaletteScheme', value)
      }
    },
    byOptions () {
      return this.$config.tools.statistics && this.$config.tools.statistics.groups
    }
  },
  mounted () {
    if (this.$config.tools.criminal && this.$config.tools.criminal.group) {
      const source = this.$config.editsources[0]
      const layer = this.$config.tools.criminal.group
      this.$store.dispatch('statistics/loadDataCustom', { source, layer })
    }
  },
  methods: {
    calculateColors () {
      this.$store.commit('statistics/aggregated', this.filteredData)
    },
    deleteStatsSelection () {
      this.$store.commit('statistics/byOption', null)
      this.$store.commit('statistics/by', null)
      this.$store.dispatch('statistics/aggregate')
    },
    async setBy (option) {
      const tooltip = { parent: this, Component: PolygonTooltip }
      this.$store.dispatch('statistics/selectBy', { option, tooltip })
      await new Promise(resolve => setTimeout(resolve, 0))
      this.$store.dispatch('statistics/aggregate')
    },
    options () {
      if (this.aggregatedDataCustom && this.aggregatedDataCustom.length > 0) {
        this.getYears()
      }
    },
    getYears () {
      this.years = [...new Set(this.aggregatedDataCustom.map(obj => {
        const date = new Date(obj.feature.properties['data_inici'])
        return date.getFullYear()
      }))]
    },
    t (key) {
      return this.$t('tools.statistics.' + key)
    }
  },
  watch: {
    filteredData: {
      handler: 'calculateColors',
      immediate: true
    },
    loadingDataCustom: {
      handler: 'options',
      immediate: true
    }
  }
}

</script>

<style>
</style>
