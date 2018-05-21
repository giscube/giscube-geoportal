<template>
  <div @click.prevent.stop=""
       @dblclick.prevent.stop=""
       class="giscube-layers-control leaflet-control"
       :class="{'showActions': showActions}">

    <div class="flex-nowrap-start layers" @click="collapsed = !collapsed">
      <a class="flex-icon link"
         ><icon name="clone" label="Layers"></icon></a>
      <a class="flex-label link">Layers</a>
    </div>

    <div v-if="!collapsed">
      <ul v-if="baseLayerSelected">
        <li class="flex-nowrap-start link" @click="baseLayerSelect=!baseLayerSelect">
          <a class="flex-icon"
             ><icon name="globe" label="base layer"></icon></a>
          <a class="flex-label">{{ baseLayerSelected.name }}</a>
          <span class="flex-icon"></span>
          <span class="flex-icon"></span>
        </li>
      </ul>

      <ul v-if="baseLayerSelect">
        <li v-for="layer in baseLayers" :key="layer.id"
            class="flex-nowrap-start link"
            @click="changeBaseLayer(layer)">
          <a class="flex-icon option gray"
             ><icon name="chevron-right" label="option"></icon></a>
          <a class="flex-label link">{{ layer.name }}</a>
        </li>
      </ul>

      <div v-if="layers.length > 0" class="sep"></div>

      <ul>
        <draggable v-model="layers" @change="layersChanged" @start="drag=true" @end="drag=false">
          <LayerItem v-for="layer in layers" :key="layer.id" :layer="layer" :map="map"
                     :showActions="showActions"
                     @remove-layer="removeLayer"
                     @toggle-layer="toggleLayer"
                     ></LayerItem>
        </draggable>
      </ul>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'

import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/check'
import 'vue-awesome/icons/chevron-down'
import 'vue-awesome/icons/chevron-right'
import 'vue-awesome/icons/clone'
import 'vue-awesome/icons/cog'
import 'vue-awesome/icons/globe'
import 'vue-awesome/icons/trash-o'

import draggable from 'vuedraggable'

import LayerItem from '@/components/LayerItem.vue'

export default {
  components: {
    draggable,
    Icon,
    LayerItem
  },
  data () {
    return {
      baseLayers: [],
      baseLayerSelected: null,
      baseLayerSelect: false,
      collapsed: false,
      showActions: false,
      layerLastId: 0,
      layers: [],
      map: null,
      lastZIndex: 0
    }
  },
  mounted () {
    this.mapObject = new L.Control()
    this.mapObject.onAdd = this.onAdd
  },
  methods: {
    addBaseLayer (baselayer, name, options) {
      if (!options) {
        options = {}
      }
      options['id'] = this.layerLastId++
      options['layer'] = baselayer
      options['name'] = name
      this.baseLayers.push(options)

      if (options.default) {
        this.baseLayerSelected = options
      }

      if (options.layer.setZIndex) {
        this.lastZIndex++
        options.layer.setZIndex(this.lastZIndex)
      }
    },
    addOverlay (layer, name, options) {
      if (!options) {
        options = {}
      }
      options['id'] = this.layerLastId++
      options['layer'] = layer
      options['name'] = name
      options['visible'] = this.map.hasLayer(layer)
      options['overlay'] = true
      this.layers.unshift(options)

      if (options.layer.setZIndex) {
        this.lastZIndex++
        options.layer.setZIndex(this.lastZIndex)
      }
    },
    changeBaseLayer (options) {
      this.map.removeLayer(this.baseLayerSelected.layer)
      this.map.addLayer(options.layer)
      this.baseLayerSelected = options
      this.baseLayerSelect = false
    },
    deferredMountedTo (parent) {
      var vm = this
      for (var i = 0; i < this.$children.length; i++) {
        if (typeof this.$children[i].deferredMountedTo === 'function') {
          this.$children[i].$on('l-add', function (e) {
            var id = e.target._leaflet_id
            if (vm.layers[id]) {
              return
            }
            var title = e.target.getAttribution()
            if (this.$attrs.title) {
              title = this.$attrs.title
            }

            vm.mapObject.addBaseLayer(e.target, title)
            vm.layers[id] = true
          })

          this.$children[i].deferredMountedTo(parent)
        }
      }
      this.parent = parent
      this.map = parent
      this.mapObject.addTo(parent)
    },
    layersChanged (event) {
      console.log('Moved!', event)
      console.log('layers', this.layers)
      let zIndex = this.lastZIndex
      this.layers.forEach(options => {
        options.layer.setZIndex(zIndex)
        zIndex--
      })
    },
    onAdd () {
      L.DomEvent.disableClickPropagation(this.$el)
      return this.$el
    },
    removeLayer (options) {
      this.layers.splice(this.layers.findIndex(function (el) {
        return el.id === options.id
      }), 1)
      this.map.removeLayer(options.layer)
    },
    toggleLayer (options) {
      if (options.visible) {
        this.map.removeLayer(options.layer)
      } else {
        this.map.addLayer(options.layer)
      }
      options.visible = !options.visible
    }
  }
}
</script>

<style lang="scss">
.giscube-layers-control {
  display: block;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,.3);
  min-width: 180px;
  max-width: 300px;
  line-height: 1em;

  .flex-nowrap-start {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
  }
  .flex-icon {
    padding: 10px 0;
    min-width: 40px;
    text-align: center;
  }
  .flex-label {
    padding: 10px 10px 10px 0;
    flex: 1;
    text-overflow: ellipsis;
  }
  .link {
    cursor: pointer;
  }
  .flex-shrink {
    flex: 0;
  }

  div.layers {
    background: #0b1923;
    color: white;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    font-size: 1.3em;
    text-transform: uppercase;
    text-decoration: none;
  }

  a.configure:hover {
    color: #0b1923;
    background-color: white;
  }

  ul {
    list-style: none;
    padding-left: 0;
    margin-bottom: 0;
  }

  div.sep {
    height: 1px;
    border-bottom: 1px solid #9c9c9c;
  }

  .gray-svg svg {
    color: gray;
  }

  .option svg {
    color: #bbb;
    margin-left: 5px;
  }

  li:hover {
    background-color: #a1d7f5;
  }

  li a.visible-on-hover {
    color: transparent;
  }
  li:hover a.visible-on-hover {
    color: #555;
  }
  a.hover-invert:hover, a.hover-invert:hover svg {
    color: white;
    background-color: #0b1923;
  }
}

.giscube-layers-control.showActions {
  // min-width: 280px;
  max-width: 500px;
}

</style>
