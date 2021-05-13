<template>
<div class="panel catalog-panel">
    <div class="panel-content">
      <slot name="title">
        <p class="panel-title">{{ t('title') }} <q-spinner v-if="loading" /></p>
      </slot>
      <div class="categories" v-if="!loading">
        <q-input ref="filter" filled v-model="filter" :label="t('filter')" class="q-my-md">
          <template v-slot:append>
            <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
          </template>
        </q-input>

        <q-tree
          :expanded.sync="expanded"
          :filter="filter"
          node-key="id"
          :nodes="catalog"
          :selected.sync="selected"
          tick-strategy="leaf"
          :ticked.sync="ticked"
          no-connectors
        >
          <template v-slot:header-root="prop">
            <div class="root">
              <span :style="'font-weight: 900; color: ' + prop.node.data.color || 'black'" class="q-mr-sm">|</span>{{ prop.node.label }}
            </div>
          </template>

          <template v-slot:header-branch="prop">
            <div class="branch">
              <q-icon name="layers" class="q-px-xs"/>
              {{ prop.node.label }}
            </div>
          </template>

          <template v-slot:header-leaf="prop">
            <div class="q-mx-sm col-10" @click="catalogResults(prop.node)">
              <q-btn icon="las la-info-circle" flat round size="sm" color="primary"/>
              {{ prop.node.label }}
            </div>
            <div class="col-1 text-right">
              <q-spinner class="text-right" v-if="loadingLayers.includes(prop.node.id)" />
            </div>
          </template>

          <template v-slot:default-body="prop">
            <div class="description q-pl-lg" v-if="prop.node.data.description">
              {{ prop.node.data.description }}
            </div>
          </template>
        </q-tree>
      </div>

    </div>
  </div>
</template>

<script>
import { QBtn, QIcon, QInput, QSpinner, QTree } from 'quasar'

import { mapState } from 'vuex'

export default {
  components: {
    QBtn, QIcon, QInput, QSpinner, QTree
  },
  data () {
    return {
      loadingLayers: []
    }
  },
  computed: {
    ...mapState({
      catalog: state => state.catalogTree.catalog,
      categoriesOpen: state => state.catalogTree.categoriesOpen,
      loading: state => state.catalogTree.loading,
      overlays: state => state.map.layers.overlays
    }),
    expanded: {
      get: function () {
        return this.categoriesOpen
      },
      set: function (value) {
        this.$store.commit('catalogTree/setCategoriesOpen', value)
      }
    },
    filter: {
      get: function () {
        return this.$store.state.catalogTree.filter
      },
      set: function (value) {
        this.$store.commit('catalogTree/setFilter', value)
      }
    },
    selected: {
      get: function () {
        return null
      },
      set: function (id) {
        if (!`${id}`.includes('.')) {
          const index = this.expanded.indexOf(id)
          index === -1 ? this.expanded.push(id) : this.expanded.splice(index, 1)
        }
      }
    },
    ticked: {
      get: function () {
        const activeLayersId = this.overlays.map(overlay => overlay.id.plainRef)
        return activeLayersId
      },
      set: function (ticked) {
        const activeLayersId = this.overlays.map(overlay => overlay.id)

        ticked.forEach(tickedId => {
          const isTicked = activeLayersId.some(layerId => { return layerId.plainRef === tickedId })
          if (!isTicked) {
            this.loadingLayers.push(tickedId)
            this.$store.dispatch('catalogTree/searchInCatalog', tickedId)
              .then(leaf => {
                const layer = leaf.toLayer(this.$root)
                this.$store.dispatch('map/addLayer', layer).then(() => {
                  this.loadingLayers = this.loadingLayers.filter(loadingLayers => loadingLayers !== tickedId)
                })
              })
          }
        })

        activeLayersId.forEach(layerId => {
          const layersToDeactivate = activeLayersId.filter(layerId => !ticked.includes(layerId.plainRef))
          layersToDeactivate.forEach(layerToDeactivate => {
            this.$store.dispatch('map/removeOverlayById', layerToDeactivate)
          })
        })
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.q = to.params.q
      vm.$store.dispatch('catalogTree/checkCategories')
    })
  },
  beforeRouteUpdate (to, from, next) {
    let vm = this
    vm.q = to.params.q
    vm.$store.dispatch('catalogTree/checkCategories')
    next()
  },
  methods: {
    catalogResults (result) {
      let results = Object.assign(Object.create(Object.getPrototypeOf(result)), result)
      if (results.isLayer) {
        this.$store.commit('search/result', results.data)
        this.$router.push({ name: 'place', params: { q: results.data.title } })
      }
    },
    resetFilter () {
      this.$store.commit('catalogTree/setFilter', '')
      this.$refs.filter.focus()
    },
    t (key) {
      return this.$t('tools.catalogTree.' + key)
    }
  }
}
</script>

<style lang="scss">
.catalog-panel {
  .categories {
    font-size: 1.13em;
    .root {
      font-weight: 600;
      color: rgb(56, 56, 56);
    }
    .branch {
      font-weight: 600;
      color: rgb(73, 73, 73);
    }
    // .leaf {
    // }
    .description {
      font-size: 0.82em;
    }
  }
}
</style>
