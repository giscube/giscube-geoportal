<template>
  <div @click.prevent.stop=""
       @doubleClick.prevent.stop=""
       class="giscube-layers-control">

    <a class="layers" data-toggle="collapse" href="#collapseControls" role="button" aria-expanded="true" aria-controls="collapseControls"
       ><icon name="clone" label="Layers"></icon>Layers</a>

    <div class="layers-list">
      <ul v-if="baseLayerSelected">
        <li @click="baseLayerSelect=!baseLayerSelect">
          <a @click.prevent.stop="baseLayerSelect=!baseLayerSelect" class="toggleLayer"
             ><icon name="globe" label="base layer"></icon></a>
          <a class="label">{{ baseLayerSelected.name }}</a>
        </li>
      </ul>

      <ul v-if="baseLayerSelect">
        <li v-for="layer in baseLayers" :key="layer.id" @click="changeBaseLayer(layer)">
          <a @click.prevent.stop="toggleLayer(layer)" class="toggleLayer option"
             ><icon name="chevron-right" label="option"></icon></a>
          <a class="label">{{ layer.name }}</a>
        </li>
      </ul>

      <ul>
        <li v-for="layer in layers" :key="layer.id" @click="toggleLayer(layer)">
          <a @click.prevent.stop="toggleLayer(layer)" class="toggleLayer"
             ><icon v-if="layer.visible" name="check" label="selected"></icon></a>
          <a class="label">{{ layer.name }}</a>
          <a @click.prevent.stop="removeLayer(layer)" class="removeLayer"
             ><icon name="trash-o" label="selected"></icon></a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'

import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/check'
import 'vue-awesome/icons/chevron-right'
import 'vue-awesome/icons/clone'
import 'vue-awesome/icons/globe'
import 'vue-awesome/icons/trash-o'

export default {
  components: {
    Icon
  },
  data () {
    return {
      baseLayers: [],
      baseLayerSelected: null,
      baseLayerSelect: false,
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
      this.layers.push(options)

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
    onAdd () {
      return this.$el
    },
    removeLayer (options) {
      this.layers.splice(options, 1)
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

<style scoped lang="scss">
.giscube-layers-control {
  display: block;
  background-color: white;
  box-shadow: 0 1px 8px rgba(0,0,0,.3);
  min-width: 180px;
  max-width: 300px;

  a.layers {
    background: #0b1923;
    display: block;
    padding: 10px 18px;
    color: #fff;
    text-transform: uppercase;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    text-decoration: none;
    font-size: 1.1em;
  }

  a.layers svg {
    margin-right: 8px;
    vertical-align: middle;
  }

  ul {
    list-style: none;
    padding-left: 0;
    margin-bottom: 0;
  }

  li {
    position: relative;
    cursor: pointer;
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  li > * {
    display: inline-block;
    vertical-align: middle;
  }

  li a.toggleLayer.option svg {
    color: #bbb;
    margin-left: 5px;
    // text-align: right;
  }

  li a {
    // border: 1px solid red;
    padding: 10px 0;
    flex: 1;
    vertical-align: middle;
  }

  li a.label {
    text-overflow: ellipsis; 
  }

  li a.removeLayer, li a.toggleLayer {
    height: 100%;
    flex: 0;
    min-width: 40px;
    text-align: center;
  }

  li a.removeLayer:hover {
    color: white;
    background-color: #0b1923;
  }

  li:hover {
    background-color: #a1d7f5;
  }

}
</style>
