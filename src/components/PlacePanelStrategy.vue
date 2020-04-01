<template>
  <component ref="component" :is="placePanelComponent" />
</template>

<script>
import get from 'lodash/get.js'
import { mapState } from 'vuex'
import { isCleanEqual } from 'src/lib/utils'

export default {
  computed: {
    placePanelComponent () {
      const config = this.$config.layout.placePanel
      const strategyValue = get(this.result, config.strategyField)
      const component = config.strategyOptions[strategyValue]
      return component || config.defaultComponent
    },
    ...mapState({
      result: state => state.search.result
    })
  },
  beforeRouteEnter (to, from, next) {
    if (isCleanEqual(from.params, to.params)) {
      next()
      return
    }

    next(vm => {
      vm.$store.dispatch('search/clearResultLayer')
    })
  },
  beforeRouteUpdate (to, from, next) {
    if (isCleanEqual(from.params, to.params)) {
      next()
      return
    }

    this.$store.dispatch('search/clearResultLayer')
    this.$store.commit('search/auto', false)
    next({ name: 'search', params: to.params, replace: true })
  },
  beforeRouteLeave (to, from, next) {
    this.$store.dispatch('search/clearResultLayer')
    next()
  }
}
</script>
