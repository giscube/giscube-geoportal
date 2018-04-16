<template>
  <div class="panel">
    <p class="panel-title">Measure</p>

    <p>Please choose measure type and click the "start measuring" button.</p>

    <el-radio-group v-model="measureType">
      <el-radio-button label="Path"></el-radio-button>
      <el-radio-button label="Area"></el-radio-button>
    </el-radio-group>

    <el-row class="start-measuring">
      <el-button>Start measuring</el-button>
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
      measureType: 'Path'
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
  methods: {
  }
}
</script>

<style>
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
