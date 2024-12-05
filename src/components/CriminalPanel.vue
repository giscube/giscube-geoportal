<template>
  <div class="panel">
    <div class="panel-content">
      <q-toolbar>
        <q-toolbar-title>{{ $t('tools.criminal.headerName') }}</q-toolbar-title>
        <q-btn
          flat
          round
          icon="info"
          color="primary"
          type="a"
          href=""
          target="_blank"
        />
      </q-toolbar>
      <div class="q-pa-sm">
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
            :min="2013"
            :max="2023"
            color="grey"
            track-color="grey"
            inner-track-color="transparent"
            selection-color="transparent"
            markers
          />
        </div>
        <palette-select
          :scheme.sync="paletteScheme"
          :groups=5
          :groupsNotShowing="true"
        />
        <Bar :data="data2" :options="options" />
      </div>
    </div>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { QSelect, QSlider, QToolbarTitle, QToolbar, QBtn } from 'quasar'

import PaletteSelect from 'components/statistics/PaletteSelect'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  components: {
    QSelect,
    QSlider,
    QToolbarTitle,
    QToolbar,
    QBtn,
    PaletteSelect,
    Bar
  },
  data () {
    return {
      factType: null,
      factTypeOptions: [
        'De la usurpació de l\'estat civil',
        'Falsedats documentals'
      ],
      penalCode: null,
      penalCodeOptions: [
        'De les falsedats', 'De les lesions'
      ],
      year: null
    }
  },
  computed: {
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
    }
  }
}

</script>

<style>
</style>
