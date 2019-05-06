<template>
  <div class="panel">

    <div class="panel-content">
      <p class="panel-title">{{ t('title') }}</p>

      <p>{{ t('explanation') }}</p>

      <q-btn
        outline
        icon="timeline"
        v-show="!measuring"
        @click="startMeasuring(false)"
        :label="t('path')"
      />
      <q-btn
        outline
        icon="fas fa-draw-polygon"
        v-show="!measuring"
        @click="startMeasuring(true)"
        :label="t('area')"
        class="q-ml-md"
      />
      <q-btn
        outline
        v-show="measuring"
        @click="stopMapMeasuring"
      >{{ t('stop') }}</q-btn>

      <div class='q-mt-md'>
        <div v-for='(measure, key) in measureControl.measures' class='measure' :key="key">
          <q-chip
            color="primary"
            text-color="white"
            removable
            @remove="removeMeasure(measure)"
          >
            <span v-html="measurementText(measure)"></span>
          </q-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { QBtn, QChip } from 'quasar'
import Vue from 'vue'
import MeasureResultPopup from 'components/MeasureResultPopup.vue'

export default {
  props: ['map'],
  components: {
    QBtn,
    QChip
  },
  data () {
    return {
      q: '',
      measureType: 'Path',
      measuring: false,
      single: true
    }
  },
  computed: {
    measureControl () {
      if (this.map && this.map.measureControl) {
        return this.map.measureControl
      } else {
        return {}
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.q = to.params.q
    })
  },
  beforeRouteUpdate (to, from, next) {
    let vm = this
    vm.q = to.params.q
    next()
  },
  destroyed () {
    this.stopMeasuring()
  },
  methods: {
    t (key) {
      return this.$t('tools.measure.' + key)
    },
    measurementText (measure) {
      let result = ''
      result += measure.area || measure.length
      result += ' ' + this.$t('units.' + measure.units_desc)
      if (measure.area) {
        result += '<sup>2</sup>'
      }
      return result
    },
    addPopupToLayer (measure) {
      let PopupContent = Vue.extend(MeasureResultPopup)
      let popup = new PopupContent({
        propsData: {
          measure: measure
        }
      })
      for (let layerId in measure.layer._layers) {
        measure.layer._layers[layerId].bindPopup(popup.$mount().$el)
      }
    },
    finishedpath () {
      if (this.single) {
        this.stopMapMeasuring()
      }
    },
    startMeasuring (measureArea) {
      if (!this.map) {
        this.$except('Measure control is missing the map property')
        return
      }
      if (!this.map.measureControl) {
        this.$except('Measure control is missing the map measureControl')
        return
      }
      this.measuring = true
      this.$store.commit('setCurrentTool', this.map.measureControl)
      this.map.on('measure:measurestop', this.stopMeasuring)
      this.map.on('measure:finishedpath', this.finishedpath)
      this.$nextTick(_ => {
        this.map.measureControl.startMeasuring({ measureArea })
      })
    },
    stopMapMeasuring () {
      this.$nextTick(_ => {
        // $nextTick needed to prevent infinite event loop
        this.map.measureControl.stopMeasuring()
      })
    },
    stopMeasuring () {
      if (!this.measuring) {
        return
      }
      this.measuring = false
      this.map.off('measure:measurestop', this.stopMeasuring)
      this.map.off('measure:finishedpath', this.stopMeasuring)
      // FIXME: hardcoded 300ms value from QueryOnClick, get from config.js
      setTimeout(() => {
        this.$store.commit('setCurrentTool', null)
      }, 300)
    },
    removeMeasure (measure) {
      measure.layer.remove()
    }
  }
}
</script>
