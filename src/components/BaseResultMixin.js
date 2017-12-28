// make sure there is a result in the state
export default {
  data () {
    return {
      q: '',
      result: {}
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.q = to.params.q
      if (vm.$store.state.result) {
        vm.result = vm.$store.state.result
        vm.viewResult()
      } else {
        vm.$store.commit('setAutoselectResult', true)
        vm.$router.push('/search/' + vm.q + '/')
      }
    })
  },
  beforeRouteUpdate (to, from, next) {
    let vm = this
    vm.q = to.params.q
    if (vm.$store.state.result) {
      vm.result = vm.$store.state.result
      vm.viewResult()
    } else {
      vm.$store.commit('setAutoselectResult', true)
      vm.$router.push('/search/' + vm.q + '/')
    }
    next()
  }
}
