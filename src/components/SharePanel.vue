<template>
  <div class="panel">

    <div class="panel-content">
      <p class="panel-title">{{ t('title') | capitalize }}</p>
      <p><span v-html="t('description')" /></p>
      <copy-to-clipboard
        :value="urlBase + queryStr"
      />
      <p class="panel-subtitle">{{ t('options') | capitalize }}</p>
      <q-input
        :label="t('message') | capitalize"
        v-model="message"
      />
      <div
        class="q-mt-sm"
      >
        <q-toggle
          :label="t('openMessage')"
          :value="!!options.om"
          @input="setFlag(options, 'om', $event)"
        />
        <br>
        <q-toggle
          :label="t('markerAtCenter')"
          :value="!!options.mc"
          @input="setFlag(options, 'mc', $event)"
        />
        <br>
        <q-toggle
          :label="t('simpleView')"
          :value="layout === 'simple'"
           @input="layout = $event ? 'simple' : null"
        />
        <br>
        <q-toggle
          :label="t('hideLayersControl')"
          :value="hideLayersControl"
          v-model="hideLayersControl"
        />
        <br>
        <q-toggle
          :label="t('catalogState')"
          :value="categoriesOpen"
          v-model="catalogState"
        />
        <br>
        <div class="row">
          <q-toggle
            :label="t('openLayerPanel')"
            v-model="goToLayerPanel"
          />
          <q-select
            outlined dense
            :class="goToLayerPanel ? 'q-ml-sm bg-white' : 'q-ml-sm'"
            style="min-width: 250px"
            :disable="!goToLayerPanel"
            v-model="layerId"
            use-input
            input-debounce="0"
            :options="layerIdOptions"
            @filter="filterCatalogOptions"
            emit-value
            map-options
            :label="t('selectLayer')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { QInput, QSelect, QToggle } from 'quasar'
import Vue from 'vue'
import L from 'src/lib/leaflet'
import ShareQuery from 'src/lib/shareQuery'
import { reverse } from 'src/lib/utils'

import CopyToClipboard from './CopyToClipboard'
import BasicPopup from './BasicPopup'

export default {
  components: {
    CopyToClipboard,
    QInput,
    QSelect,
    QToggle
  },
  data () {
    const l = window.location
    const urlBase = l.origin + l.pathname + '#/share/'
    return {
      layout: null,
      hideLayersControl: false,
      catalogState: false,
      goToLayerPanel: false,
      layerId: null,
      layerIdOptions: [],
      catalogOptions: [],
      message: '',
      options: {},
      urlBase
    }
  },
  computed: {
    map () {
      return this.$store.state.map.mapObject
    },
    mapState () {
      return this.$store.state.map.state
    },
    categoriesOpen () {
      return this.catalogState && this.$store.state.catalogTree.categoriesOpen
    },
    results () {
      return this.$store.state.map.layers.overlays
        .map(overlay => {
          return ({ ref: overlay.id, opacity: overlay.getOpacity() })
        })
        .filter(({ ref }) => ref.canOpen && ref.canOpen())
    },
    queryStr () {
      // a return ''
      return ShareQuery.toQuery({
        options: this.options,
        basemap: this.$store.getters['map/baseMapIndex'],
        ...this.mapState,
        message: this.message,
        layout: this.layout,
        catalog: this.categoriesOpen,
        hideLayersControl: this.hideLayersControl,
        giscube_id: this.layerId,
        geom: [
          ...this.sharedLayer.getLayers(),
          ...(this.$store.getters['map/drawnLayers']() || [])
        ],
        results: this.results
      })
    },
    sharedLayer () {
      return this.$store.state.map.shared
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('catalogTree/checkCategories')
      vm.$store.commit('setCurrentTool', 'share')

      if (Object.keys(to.query).length > 0) {
        vm.$store.commit('layout/isCustomView', true)
        vm.applyQuery(to.query, 'home')
      }
    })
  },
  beforeRouteUpdate (to, from, next) {
    if (Object.keys(to.query).length > 0) {
      this.applyQuery(to.query)
    }
    next()
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit('setCurrentTool', null)
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
    applyQuery (query, redirectTo) {
      this.$nextTick(() => {
        this.message = ShareQuery.extract(query, 'm')

        const layout = ShareQuery.extract(query, 'la')
        if (layout) {
          this.$store.commit('layout/setLayout', layout)
        }

        const layersControl = ShareQuery.extract(query, 'hlc')
        if (layersControl === 'true') {
          this.$store.commit('map/hideLayersControl', true)
        }

        const map = this.$store.state.map.mapObject
        if (!map) {
          // Watch map until is set and then apply map-related queries
          this.waitFor('$store.state.map.mapObject', newMap => {
            this.applyMapQuery(query, newMap)
          })
        } else {
          this.applyMapQuery(query, map)
        }

        const catalogState = ShareQuery.extract(query, 'ca')
        if (catalogState) {
          const categoriesOpen = catalogState.split(',').map(id => parseInt(id))
          this.$store.commit('catalogTree/setCategoriesOpen', categoriesOpen)
          redirectTo = 'catalog'
        }

        const giscubeId = ShareQuery.extract(query, 'id')
        if (giscubeId) {
          this.$router.replace({ name: 'search', query: { giscube_id: giscubeId } })
          return
        }

        if (redirectTo) {
          this.$router.replace({ name: redirectTo })
        }
      })
    },
    applyMapQuery (query, map) {
      this.sharedLayer.clearLayers()
      const center = ShareQuery.extract(query, 'c')
      const zoom = ShareQuery.extract(query, 'z')
      this.$nextTick(() => { // Wait for the sidebar size to be set
        map.setView(center, zoom)
      })

      const g = ShareQuery.extract(query, 'g')

      this.options = ShareQuery.extract(query, 'o') || {}
      const marker = this.options.mc && L.marker(center)

      if (marker) {
        this.sharedLayer.addLayer(marker)
      }
      if (g) {
        g.forEach(layer => {
          if (layer.sharedMessage) {
            layer.bindPopup(layer.sharedMessage)
          }
          this.sharedLayer.addLayer(layer)
        })
      }

      if (this.message) {
        const popup = this.makePopup({ map, layer: marker })

        if (this.options.om) {
          if (marker) {
            marker.openPopup()
          } else {
            map.openPopup(popup, center)
          }
        }
      }

      const l = ShareQuery.extract(query, 'l')
      if (l) {
        const promises = l.map(({ ref, opacity }) => ref.addAsResult(opacity, this.$root))

        const addAll = async () => {
          for (let promise of reverse(promises)) {
            const add = await promise
            add()
          }
        }
        addAll().then(() => this.$store.dispatch('map/reorderOverlay'))
      }
    },
    makePopup ({ map, layer }) {
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

      if (layer) {
        popupComponent.$on('close', () => layer.closePopup())
        layer.bindPopup(popupContainer)
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
    },
    filterCatalogOptions (val, update) {
      if (!val) {
        update(() => {
          this.layerIdOptions = this.catalogOptions
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.layerIdOptions = this.catalogOptions.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })
    },
    getCatalogLeaves (node, parentRoute) {
      if (!node.header.includes('leaf')) {
        for (let child of node.children) {
          this.getCatalogLeaves(child, `${parentRoute} > ${child.label}`)
        }
      } else {
        this.catalogOptions.push({
          label: `${parentRoute}`,
          value: node.id
        })
      }
    },
    getCatalogOptions () {
      this.catalogOptions = []
      for (let root of this.$store.state.catalogTree.catalog) {
        this.getCatalogLeaves(root, root.label)
      }
    }
  },
  watch: {
    goToLayerPanel (value) {
      if (value) {
        this.getCatalogOptions()
      } else {
        this.layerId = null
      }
    }
  }
}
</script>

<style>
</style>
