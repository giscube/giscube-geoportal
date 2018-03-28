<template>
  <div class="panel">
    <p class="panel-title">Results for {{ q }}
      <icon v-show="searching" name="spinner" pulse label="Searching"></icon></p>

    <p v-if="showSearchError" class="list-group-item">Error retrieving results</p>
    <p v-if="showSearchEmpty && !showSearchError" class="list-group-item">No matches found</p>

    <div v-if="results">
      <SearchResult v-for="(result, index) in results" :result='result'
        :key="index" :map='map' :resultsLayer='resultsLayer' />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import L from 'leaflet'
import SearchResult from './SearchResult.vue'

import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/spinner'

export default {
  components: {
    Icon,
    SearchResult
  },
  props: ['map'],
  data () {
    return {
      q: '',
      searchsRunning: 0,
      searchError: false,
      searchEmpty: false,
      resultsPartials: {}
    }
  },
  computed: {
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
      console.log('Ajax search for term:', to.params.q)
      vm.q = to.params.q
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.q = to.params.q
    next()
  },
  created () {
    if (!this.resultsLayer) {
      let layerGeoJson = L.geoJson('', {
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.title)
        }
      })
      this.$store.commit('createResultsLayer', layerGeoJson)
    }
  },
  destroyed () {
    this.resultsLayer.clearLayers()
  },
  methods: {
    qChanged () {
      if (this.map) {
        this.resultsLayer.addTo(this.map)
      }

      // reset
      this.resultsPartials = {}
      this.searchEmpty = false
      this.searchError = false
      this.resultsLayer.clearLayers()

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
          console.log(error)
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
        console.log('add layers to map', search.name)
        data.results.forEach(element => {
          var layer = L.GeoJSON.geometryToLayer(element.geojson)
          layer.bindPopup(element.geojson.properties.title)
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

<style scoped>
.panel {
    padding: 0;
}
.panel-title {
  font-size: 1.5em;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  padding: 0 20px 15px 20px;
  margin: 0;
}

.list-group-item {
  min-height: 65px;
}
</style>
