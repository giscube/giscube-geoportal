<template>
  <div class="panel">

    <div class="panel-content">
      <p class="panel-title">{{ t('title') }}</p>
    </div>

    <copy-to-clipboard
      :value="urlBase + queryStr"
    />
  </div>
</template>

<script>
import * as ShareQuery from 'src/lib/shareQuery'
import CopyToClipboard from './CopyToClipboard'

export default {
  components: {
    CopyToClipboard
  },
  data () {
    const l = window.location
    const urlBase = l.origin + l.pathname + '#/share/'
    return {
      urlBase,
      queryStr: '',
      copied: 0
    }
  },
  beforeRouteEnter (to, from, next) {
    if (Object.keys(to.query).length > 0) {
      next(vm => vm.applyQuery(to.query))
    } else {
      next()
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (Object.keys(to.query).length > 0) {
      this.applyQuery(to.query)
    }
    next()
  },
  watch: {
    '$store.state.map.state': {
      handler: 'setMapState',
      deep: true
    }
  },
  mounted () {
    this.$nextTick(() => this.setMapState(this.$store.state.map.state))
  },
  methods: {
    t (key) {
      return this.$t('tools.share.' + key)
    },
    applyQuery (query) {
      const map = this.$store.state.map.mapObject
      if (!map) {
        // Watch map until is set and then apply map-related queries
        const unwatch = this.$watch('$store.state.map.mapObject', newMap => {
          if (newMap) {
            unwatch()
            this.applyMapQuery(query, newMap)
          }
        })
      } else {
        this.applyMapQuery(query, map)
      }
    },
    applyMapQuery (query, map) {
      const z = ShareQuery.extract(query, 'z')
      if (z !== void 0) {
        map.setZoom(z)
      }
      const c = ShareQuery.extract(query, 'c')
      if (c !== void 0) {
        map.flyTo(c)
      }
    },
    setMapState (value) {
      this.queryStr = ShareQuery.toQuery(value)
    }
  }
}
</script>

<style>
</style>
