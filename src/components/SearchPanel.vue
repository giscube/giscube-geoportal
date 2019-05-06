<template>
  <div class="panel search-panel">

    <search-bar @search-start="qChanged" />

    <div class="panel-content">

      <p v-if="!q">{{ t('instructions') }}</p>

      <p v-if="q" class="panel-title">{{ t('results', { q }) }}
        <q-spinner v-if="searching" />
      </p>

      <p v-if="showSearchError" class="list-group-item">{{ t('resultsError') }}</p>
      <p v-if="q && showSearchEmpty && !showSearchError" class="list-group-item">{{ t('noResults')}}</p>
    </div>
    <div v-if="results">
      <SearchResult v-for="(result, index) in results" :result='result'
        :key="index" :map='map' :resultsLayer='resultsLayer' />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import L from '../lib/leaflet'
import SearchBar from 'components/SearchBar.vue'
import SearchResult from './SearchResult.vue'
import SearchResultPopup from './SearchResultPopup'

export default {
  components: {
    SearchBar,
    SearchResult
  },
  props: ['map'],
  data () {
    return {
      searchsRunning: 0,
      searchError: false,
      searchEmpty: false,
      resultsPartials: {}
    }
  },
  computed: {
    q () {
      return this.$store.state.searchQ
    },
    resultsLayer () {
      return this.$store.state.resultsLayer
    },
    searching () {
      return this.searchsRunning > 0
    },
    showSearchEmpty () {
      if (this.searching) {
        return false
      } else {
        return this.results.length === 0
      }
    },
    showSearchError () {
      if (this.searching) {
        return false
      } else {
        return this.searchError && this.results.length === 0
      }
    },
    results () {
      var all = []
      this.$store.config.searches.forEach(search => {
        if (this.resultsPartials[search.name]) {
          all.push.apply(all, this.resultsPartials[search.name])
        }
      })
      return all
    }
  },
  watch: {
    'q': 'qChanged',
    'searching': 'searchingChanged'
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.commit('search', to.params.q)
      vm.qChanged()
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.$store.commit('search', to.params.q)
    this.qChanged()
    next()
  },
  destroyed () {
    this.resultsLayer.clearLayers()
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.search.' + key, ...args)
    },
    qChanged () {
      // reset
      this.resultsPartials = {}
      this.searchEmpty = false
      this.searchError = false
      if (this.resultsLayer) {
        this.resultsLayer.clearLayers()
      }

      if (this.q === undefined || this.q === '') {
        return
      }

      let self = this
      this.$store.config.searches.forEach(search => {
        var searchUrl = search.url

        self.searchsRunning += 1
        axios.get(searchUrl, {
          params: {
            q: self.q
          }
        })
          .then(function (response) {
            self.parseResults(search, response.data)
            self.searchsRunning -= 1
          })
          .catch(function (error) {
            this.$except.http(error)
            self.searchsRunning -= 1
            self.searchError = true
          })
      })
    },
    parseResults (search, data) {
      if (data.results === undefined) {
        this.searchError = true
        return
      }

      if (data['results'].length === 0) {
        this.searchEmpty = true
        return
      }

      if (search.is_geojson) {
        data.results.forEach(element => {
          var layer = L.GeoJSON.geometryToLayer(element.geojson)
          let PopupContent = Vue.extend(SearchResultPopup)
          let popup = new PopupContent({
            propsData: {
              feature: element
            }
          })
          layer.bindPopup(popup.$mount().$el)
          this.resultsLayer.addLayer(layer)
          element.layer = layer
        })
      }

      Vue.set(this.resultsPartials, search.name, data.results)
    },
    searchingChanged () {
      if (!this.searching) {
        if (this.results.length === 1 && this.$store.state.autoselectResult) {
          let element = this.results[0]
          // save selected place in store
          this.$store.commit('selectResult', element)
          // then produces the route change
          // FIXME: base this on search used
          if (element.geojson) {
            this.$router.push('/place/' + element.title + '/')
          } else {
            this.$router.push('/geoportal/' + element.title + '/')
          }
        }
        this.$store.commit('setAutoselectResult', false)
      }
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
