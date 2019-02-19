<template>
  <div class="panel">

    <div class="panel-content">
      <p class="panel-title">Measure</p>

      <p>Please choose measure type and click the "start measuring" button.</p>

      <el-radio-group v-model="measureType">
        <el-radio-button label="Path"></el-radio-button>
        <el-radio-button label="Area"></el-radio-button>
      </el-radio-group>

      <el-row class="start-measuring">
        <el-button v-if="!measuring" @click="startMeasuring">Start measuring</el-button>
        <el-button v-if="measuring" @click="stopMeasuring">Stop measuring</el-button>
      </el-row>

      <p class="panel-subtitle">Measurements</p>
      <div class='measures-list-container'>
        <div v-for='(measure, key) in measureControl.measures' class='measure' :key="key">
          <div>
            <a @click="removeMeasure(measure)" class="flex-icon flex-shrink link"
               ><icon name="trash" label="configure"></icon></a>
            <span v-if="!measure.area" class='title'>{{ measure.length }} {{ measure.units_desc }}</span>
            <span v-if="measure.area" class='title'>{{ measure.area }} {{ measure.units_desc }}<sup>2</sup></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/spinner'
import MeasureResultPopup from 'components/MeasureResultPopup.vue'

export default {
  components: {
    Icon
  },
  props: ['map'],
  data () {
    return {
      q: '',
      measureType: 'Path',
      measuring: false
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
  watch: {
    'map': 'mapChanged',
    'measureType': 'measureTypeChanged'
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
    mapChanged () {
      if (this.map === null) {
        return
      }
      this.map.on('measure:measurestop', () => {
        if (this.measuring) {
          this.stopMeasuring()
        }
      })
      this.map.on('measure:finishedpath', e => {
        this.addPopupToLayer(e.measure)
      })
    },
    measureTypeChanged () {
      if (this.measuring) {
        this.map.measureControl.startMeasuring(
          { 'measureArea': this.measureType === 'Area' })
      }
    },
    startMeasuring () {
      this.$store.commit('setCurrentTool', this.map.measureControl)
      this.map.measureControl.startMeasuring(
        { 'measureArea': this.measureType === 'Area' })
      this.measuring = true
    },
    stopMeasuring () {
      this.measuring = false
      this.$store.commit('setCurrentTool', null)
      this.map.measureControl.stopMeasuring()
    },
    removeMeasure (measure) {
      measure.layer.remove()
    }
  }
}
</script>

<style scoped>
.list-group-item {
  min-height: 65px;
}

.start-measuring {
  text-align: right;
}

.link {
  cursor: pointer;
}
</style>
