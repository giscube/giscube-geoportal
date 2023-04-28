<template>
  <div class="panel">
    <div class="panel-content">
      <p class="panel-title">{{ t('title') }}</p>

      <div class="row space-items-md">
        <q-btn-group class="no-shadow">
          <q-btn
            icon="place"
            v-show="!measuring"
            :disable="hasLayers"
            @click="addMeasure('point')"
          >
            <q-tooltip>
              {{ t('marker') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            icon="fas fa-draw-polygon"
            v-show="!measuring"
            :disable="hasLayers"
            @click="startMeasuring(true)"
          >
            <q-tooltip>
              {{ t('area') }}
            </q-tooltip>
          </q-btn>
          <q-btn
             icon="fas fa-trash"
             v-show="hasLayers"
             @click="deleteLayer"
          >
            <q-tooltip>
              {{ t('delete') }}
            </q-tooltip>
          </q-btn>
        </q-btn-group>
        <q-btn
          outline
          v-show="measuring"
          @click="stopMapMeasuring"
        >
          {{ t('stop') }}
        </q-btn>
      </div>
      <div class="q-gutter-md">
        <q-input v-model="title" :label="t('titleInput')" />
        <q-input v-model="description" autogrow :label="t('descriptionInput')" />
        <q-input
          v-model="email"
          type="email"
          @blur="emailVerification"
          :label="t('emailInput')"
          :error="showError"
          :error-message="t('errorMessage')"
        />
        <q-btn color="primary" :label="t('post')" :loading="loading" @click="send('geojson')" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { ClosePopup, QBtn, QBtnGroup, QInput, QTooltip } from 'quasar'
import { mapState } from 'vuex'
import L from 'src/lib/leaflet'
import { createLayer } from 'src/lib/geomUtils'

export default {
  components: {
    QBtn,
    QBtnGroup,
    QInput,
    QTooltip
  },
  directives: {
    ClosePopup
  },
  data () {
    return {
      description: null,
      email: null,
      incidenceLayers: [],
      loading: false,
      measureArea: null,
      measuring: false,
      multi: false,
      showError: false,
      title: null
    }
  },
  computed: {
    ...mapState({
      map: state => state.map.mapObject
    }),
    measureControl () {
      if (this.map && this.map.measureControl) {
        return this.map.measureControl
      } else {
        return {}
      }
    },
    incidence () {
      return this.$store.state.map.incidence
    },
    hasLayers () {
      return this.incidenceLayers?.length !== 0
    }
  },
  watch: {
    incidence: {
      handler: 'updateIncidenceLayers',
      immediate: true
    }
  },
  destroyed () {
    this.stopMeasuring()
  },
  methods: {
    t (key) {
      return this.$t('tools.incidence.' + key)
    },
    updateIncidenceLayers () {
      this.$nextTick(() => {
        this.incidenceLayers = this.incidence.getLayers()
      })
    },
    measurementText (measure) {
      let result = ''
      result += measure.area || Math.round(measure.length_ori * 100) / 100
      result += ' ' + this.$t('units.' + measure.units_desc)
      if (measure.area) {
        result += '<sup>2</sup>'
      }
      return result
    },
    measureLayer (measure) {
      return measure.layer.getLayers()[0]
    },
    finishedpath () {
      if (this.multi) {
        requestAnimationFrame(() => this.startMeasuring(this.measureArea))
      } else {
        this.stopMapMeasuring()
      }
    },
    polygonDrawer () {
      this.map.on('draw:created', (event) => {
        var layer = event.layer
        this.incidence.addLayer(layer)
        this.updateIncidenceLayers()
      })
      return new L.Draw.Polygon(this.map, {})
    },
    startMeasuring (measureArea) {
      this.polygonDrawer().enable()
      this.measureArea = measureArea
      this.$store.commit('setCurrentTool', this.polygonDrawer)
      this.map.on('measure:measurestop', this.stopMeasuring)
      this.map.on('measure:finishedpath', this.finishedpath)
    },
    addMeasure (type) {
      this.measuring = true
      this.$store.commit('setCurrentTool', this.map.measureControl)
      let config
      createLayer({
        map: this.map,
        type,
        config
      })
        .then(measure => this.finishAddMeasure(measure, type))
        .catch(_ => this.stopMeasuring())
    },
    finishAddMeasure (measure, type) {
      this.$store.dispatch('map/addIncidenceLayer', measure)
      this.updateIncidenceLayers()
      if (this.multi) {
        requestAnimationFrame(() => this.addMeasure(type))
      } else {
        this.stopMeasuring()
      }
    },
    stopMapMeasuring () {
      this.$store.dispatch('map/stopDrawing')
      this.$nextTick(_ => {
        // $nextTick needed to prevent infinite event loop
        this.map.measureControl.stopMeasuring()
      })
    },
    stopMeasuring () {
      if (!this.measuring) {
        return
      }
      this.measuring = false
      this.map.off('measure:measurestop', this.stopMeasuring)
      this.map.off('measure:finishedpath', this.finishedpath)
      // FIXME: hardcoded 300ms value from QueryOnClick, get from config
      setTimeout(() => {
        this.$store.commit('setCurrentTool', null)
      }, 300)
    },
    send (fileType) {
      const features = [
        ...this.incidence.getLayers().map(layer => layer.toGeoJSON())
      ]
      this.loading = true
      var content = {
        'user': null,
        'title': this.title,
        'description': this.description,
        'email': this.email,
        'geometry': features[0]?.geometry || null
      }
      const contentJSON = JSON.stringify(content)
      const apiUrl = this.$config.incidence.url
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      var config = {
        timeout: 10000,
        headers: headers
      }

      axios.post(apiUrl, contentJSON, config)
        .then(response => {
          this.$q.notify({
            message: this.t('message'),
            color: 'positive',
            position: 'top'
          })
          this.title = null
          this.description = null
          this.email = null
          this.loading = false
        }).catch(error => {
          this.$except(error)
          this.loading = false
        })
    },
    deleteLayer () {
      this.incidenceLayers.forEach(layer => {
        this.incidence.removeLayer(layer)
        this.updateIncidenceLayers()
      })
    },
    emailVerification () {
      // eslint-disable-next-line
      let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
      if (this.email) {
        let valid = reg.test(this.email)
        if (valid) {
          this.showError = false
        } else {
          this.showError = true
        }
      }
    }
  }
}
</script>
