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
          :label="t('controlledMap')"
          :value="!!options.ctrl"
           @input="setFlag(options, 'ctrl', $event)"
        />
        <q-toggle
          :label="t('deactivateClick')"
          :value="!!options.dc"
           @input="setFlag(options, 'dc', $event)"
        />
        <br>
        <q-toggle
          :label="t('zoomDrawingLayers')"
          :value="!!options.zd"
           @input="setFlag(options, 'zd', $event)"
        />
        <br>
        <q-toggle
          :label="t('clusterMarkers')"
          :value="clusterMarkers"
          v-model="clusterMarkers"
        />
        <br>
        <q-toggle
          :label="t('closeSidebar')"
          :value="closeSidebar"
          v-model="closeSidebar"
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
      closeSidebar: false,
      clusterMarkers: false,
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
        closeSidebar: this.closeSidebar,
        clusterMarkers: this.clusterMarkers,
        hideLayersControl: this.hideLayersControl,
        giscube_id: this.layerId,
        geom: [
          ...this.sharedLayer.getLayers(),
          ...(this.$store.getters['map/drawnLayers']() || [])
        ],
        search: this.pinLayers,
        results: this.results
      })
    },
    pinLayers () {
      if (this.$store.state.map.pinLayers && typeof this.$store.state.map.pinLayers.getLayers === 'function') {
        return this.$store.state.map.pinLayers.getLayers()
      }
      return []
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
      this.$nextTick(async () => {
        this.message = ShareQuery.extract(query, 'm')

        const layout = ShareQuery.extract(query, 'la')
        if (layout) {
          this.$store.commit('layout/setLayout', layout)
        }

        const closeSidebar = ShareQuery.extract(query, 'csb')
        if (closeSidebar === 'true') {
          this.$store.dispatch('layout/setSidebarOpen', false)
        }

        const layersControl = ShareQuery.extract(query, 'hlc')
        if (layersControl === 'true') {
          this.$store.commit('map/hideLayersControl', true)
        }

        const map = this.$store.state.map.mapObject
        const giscubeId = ShareQuery.extract(query, 'id')
        if (!map) {
          // Watch map until is set and then apply map-related queries
          this.waitFor('$store.state.map.mapObject', async newMap => {
            giscubeId ? await this.applyMapQuery(query, newMap) : this.applyMapQuery(query, newMap)
          })
        } else {
          giscubeId ? await this.applyMapQuery(query, map) : this.applyMapQuery(query, map)
        }

        const catalogState = ShareQuery.extract(query, 'ca')
        if (catalogState) {
          const categoriesOpen = catalogState.split(',').map(id => parseInt(id))
          this.$store.commit('catalogTree/setCategoriesOpen', categoriesOpen)
          redirectTo = 'catalog'
        }

        if (giscubeId) {
          this.$router.replace({ name: 'search', query: { giscube_id: giscubeId } })
          return
        }

        if (redirectTo) {
          this.$router.replace({ name: redirectTo })
        }
      })
    },
    async applyMapQuery (query, map) {
      this.sharedLayer.clearLayers()
      const center = ShareQuery.extract(query, 'c')
      const zoom = ShareQuery.extract(query, 'z')
      this.$nextTick(() => { // Wait for the sidebar size to be set
        map.setView(center, zoom)
      })

      const g = ShareQuery.extract(query, 'g')
      const s = ShareQuery.extract(query, 's')

      const clusterMarkers = ShareQuery.extract(query, 'cm')
      this.options = ShareQuery.extract(query, 'o') || {}
      const marker = this.options.mc && L.marker(center)

      if (marker) {
        this.sharedLayer.addLayer(marker)
      }
      if (g) {
        this.addLayers(g, clusterMarkers)
      }
      if (s) {
        this.addLayers(s, clusterMarkers)
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

      if (this.options.ctrl) {
        this.$store.commit('layout/setMapControlled', true)
      }
      if (this.options.dc) {
        this.$store.commit('layout/setdeactivateClick', true)
      }

      if (this.options.zd) {
        if (this.sharedLayer && typeof this.sharedLayer.getLayers === 'function') {
          const layers = this.sharedLayer.getLayers()
          if (layers.length > 0) {
            const bounds = L.latLngBounds(layers.map(layer => layer.getBounds ? layer.getBounds() : layer.getLatLng()))
            map.fitBounds(bounds)
          }
        }
      }

      const l = ShareQuery.extract(query, 'l')
      if (l) {
        const overlays = {}
        const promises = l.map(({ ref, opacity }, index) => ({
          promise: ref.getAsResult(opacity, this.$root),
          index
        }))

        await Promise.all(
          promises.map(async ({ promise, index }) => {
            const result = await promise
            overlays[index] = result
          })
        )
        for (let k of Object.keys(overlays).reverse()) {
          this.$root.$store.dispatch('map/addOverlay', overlays[k])
        }
        this.$store.dispatch('map/reorderOverlay')
      }
    },
    addLayers (geom, clusterMarkers) {
      let layers = this.sharedLayer
      if (clusterMarkers) {
        layers = L.markerClusterGroup()
      }
      geom.forEach(layer => {
        if (layer.sharedMessage) {
          layer.bindPopup(layer.sharedMessage)
        }
        layers.addLayer(layer)
      })
      if (clusterMarkers) {
        this.sharedLayer.addLayer(layers)
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
