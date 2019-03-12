<template>
  <div class="panel">

    <div class="panel-content">
      <p class="panel-title">Measure</p>

      <p>Please select measure type, then click on the map. Double-click to finish a measure.</p>

      <q-btn
        flat
        v-show="!measuring"
        color="primary"
        @click="startMeasuring(false)"
        label="Path"
      />
      <q-btn
        flat
        v-show="!measuring"
        color="primary"
        @click="startMeasuring(true)"
        label="Area"
      />
      <q-btn
        v-show="measuring"
        flat
        color="primary"
        @click="stopMapMeasuring"
      >Stop measuring</q-btn>

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
import Vue from 'vue'
import MeasureResultPopup from 'components/MeasureResultPopup.vue'

export default {
  props: ['map'],
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
    measurementText (measure) {
      let result = ''
      result += measure.area || measure.length
      result += ' ' + measure.units_desc
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
        console.error('Measure control is missing the map property')
        return
      }
      if (!this.map.measureControl) {
        console.error('Measure control is missing the map measureControl')
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
