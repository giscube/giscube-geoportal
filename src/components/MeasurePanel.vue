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

  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/spinner'

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
    mapChanged () {
      if (this.map === null) {
        return
      }
      this.map.on('measure:measurestop', () => {
        if (this.measuring) {
          this.stopMeasuring()
        }
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
</style>
