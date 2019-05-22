<template>
  <div class="panel">

    <div class="panel-content">
      <p class="panel-title">{{ t('title') | capitalize }}</p>
      <copy-to-clipboard
        :value="urlBase + queryStr"
      />
      <p class="panel-subtitle">{{ t('options') | capitalize }}</p>
      <q-input
        :label="t('message') | capitalize"
        v-model="message"
        outlined
        bg-color="white"
      />
      <div
        class="q-mt-sm"
      >
        <q-toggle
          label="Open message"
          :value="!!options.om"
          @input="setFlag(options, 'om', $event)"
        />
        <q-toggle
          label="Marker at the center"
          :value="!!options.mc"
          @input="setFlag(options, 'mc', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { QInput, QToggle } from 'quasar'
import Vue from 'vue'
import L from 'src/lib/leaflet'
import * as ShareQuery from 'src/lib/shareQuery'

import CopyToClipboard from './CopyToClipboard'
import BasicPopup from './BasicPopup'

export default {
  components: {
    CopyToClipboard,
    QInput,
    QToggle
  },
  data () {
    const l = window.location
    const urlBase = l.origin + l.pathname + '#/share/'
    return {
      urlBase,

      options: {},
      message: ''
    }
  },
  computed: {
    mapState () {
      return this.$store.state.map.state
    },
    queryStr () {
      return ShareQuery.toQuery({
        options: this.options,
        ...this.mapState,
        message: this.message
      })
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
  methods: {
    t (key) {
      return this.$t('tools.share.' + key)
    },
    waitFor (key, callback, condition) {
      const unwatch = this.$watch(key, newValue => {
        if (condition ? condition(newValue) : newValue) {
          unwatch()
          callback(newValue)
        }
      })
    },
    applyQuery (query) {
      this.message = ShareQuery.extract(query, 'm')

      const map = this.$store.state.map.mapObject
      if (!map) {
        // Watch map until is set and then apply map-related queries
        this.waitFor('$store.state.map.mapObject', newMap => {
          this.applyMapQuery(query, newMap)
        })
      } else {
        this.applyMapQuery(query, map)
      }
    },
    applyMapQuery (query, map) {
      ShareQuery.apply(query, 'z', map.setZoom.bind(map))
      const center = ShareQuery.apply(query, 'c', map.flyTo.bind(map))

      this.options = ShareQuery.extract(query, 'o') || {}
      const marker = this.options.mc && L.marker(center)
      if (marker) {
        map.addLayer(marker)
      }

      if (this.message) {
        const popup = this.makePopup({ map, marker })

        if (this.options.om) {
          if (marker) {
            marker.openPopup()
          } else {
            map.openPopup(popup, center)
          }
        }
      }
    },
    makePopup ({ map, marker }) {
      const Popup = Vue.extend(BasicPopup)
      const popupComponent = new Popup({
        parent: this,
        propsData: {
          message: this.message
        }
      })

      const popupContainer = L.popup({
        closeOnClick: true,
        closeOnEscapeKey: true
      })
      popupContainer.setContent(popupComponent.$mount().$el)

      if (marker) {
        popupComponent.$on('close', () => marker.closePopup())
        marker.bindPopup(popupContainer)
      } else {
        popupComponent.$on('close', () => popupContainer.remove())
      }

      return popupContainer
    },
    setFlag (obj, key, value) {
      if (value) {
        this.$set(obj, key, true)
      } else {
        this.$delete(obj, key)
      }
    }
  }
}
</script>

<style>
</style>
