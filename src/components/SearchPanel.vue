<template>
  <div class="panel search-panel">

    <slot name="bar" :q="q">
      <search-bar :query="q" />
    </slot>

    <div class="panel-content">
      <p v-if="state === STATES.INITIAL">
        <slot name="instructions">{{ t('instructions') }}</slot>
      </p>
      <div v-else-if="state === STATES.HAS_QUERY">
        <p class="panel-title">{{ t('history') | capitalize }}</p>
        <p
          v-for="(s, i) in searchHistory"
          :key="'search-history-' + i"
        >
          <a @click="search(s)" class="cursor-pointer">{{ s }}</a>
        </p>
      </div>
      <p v-else-if="state === STATES.LOADING_RESULTS || state === STATES.RESULTS_LOADED" class="panel-title">{{ t('results', { q }) }}
        <q-spinner v-if="state === STATES.LOADING_RESULTS" />
      </p>

      <p v-if="hasErrors" class="list-group-item">{{ t('resultsError') }}</p>
      <p v-else-if="state === STATES.RESULTS_LOADED && results.length === 0" class="list-group-item">{{ t('noResults')}}</p>
    </div>
    <search-result
      v-for="(result, index) in results"
      :result='result'
      :key="index"
    />
  </div>
</template>

<script>
import { QSpinner } from 'quasar'
import { STATES } from '../store/module-search/constants'
import SearchBar from 'components/SearchBar.vue'
import SearchResult from './SearchResult.vue'

export default {
  components: {
    QSpinner,
    SearchBar,
    SearchResult
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.$store.dispatch('search/search', { query: to.params.q }))
  },
  beforeRouteUpdate (to, from, next) {
    this.$store.dispatch('search/clearResultLayer')
    this.$store.dispatch('search/search', { query: to.params.q })
    next()
  },
  beforeRouteLeave (to, from, next) {
    this.$store.dispatch('search/clearResultLayer')
    next()
  },
  computed: {
    STATES () {
      return STATES
    },
    hasErrors () {
      return this.$store.state.search.errorFetching
    },
    q () {
      return this.$store.state.search.query
    },
    searchHistory () {
      return this.$store.state.search.history
    },
    results () {
      return this.$store.getters['search/results']
    },
    state () {
      return this.$store.getters['search/state']
    }
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.search.' + key, ...args)
    },
    search (s) {
      this.$router.push({ name: 'search', params: { q: s } })
    }
  }
}
</script>

<style lang="scss">
.search-panel {
  .list-group-item {
    min-height: 85px;
    padding: 10px 7px 5px 20px;
    border-bottom: 1px solid rgba(0,0,0,.125);
    background-color: white;
  }
}
</style>
