<template>
  <div class="panel">
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
    <MeasureList ref="measureList" @remove-measure="removeMeasure"></MeasureList>

  </div>
</template>

<script>
import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/spinner'
import MeasureList from '@/components/MeasureList.vue'
import MeasureResultPopup from '@/components/MeasureResultPopup.vue'

export default {
  components: {
    Icon,
    MeasureList
  },
  props: ['map'],
  data () {
    return {
      q: '',
      measureType: 'Path',
      measuring: false
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
      this.map.on('measure:finishedpath', (e) => {
        this.$refs.measureList.measures.push(e.measure)
        this.addPopupToLayer(e.measure)
      })
    },
    measureTypeChanged () {
      if (this.measuring) {
        this.map.measureControl.startMeasuring(
          {'measureArea': this.measureType === 'Area'})
      }
    },
    startMeasuring () {
      this.$store.commit('setCurrentTool', this.map.measureControl)
      this.map.measureControl.startMeasuring(
        {'measureArea': this.measureType === 'Area'})
      this.measuring = true
    },
    stopMeasuring () {
      this.measuring = false
      this.$store.commit('setCurrentTool', null)
      this.map.measureControl.stopMeasuring()
    },
    removeMeasure (measure) {
      this.map.measureControl.removeMeasure(measure.layer)
    }
  }
}
</script>

<style scoped>
.list-group-item {
  min-height: 65px;
}
.panel {
    padding: 0 20px 15px 20px;
}
.panel-title {
  font-size: 1.5em;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  margin-bottom: 10px;
}

.start-measuring {
  text-align: right;
}

.panel-subtitle {
font-size: 1.4em;
font-family: 'Lato', sans-serif;
font-weight: 400;
margin-top: 20px;
margin-bottom: 10px;
}
</style>
