<template>
  <div @click.prevent.stop=""
       @dblclick.prevent.stop=""
       class="giscube-layers-control leaflet-control"
       :class="{'showActions': showActions}">

    <div class="flex-nowrap-start layers-title" @click="collapsed = !collapsed">
      <a class="flex-icon link"
         ><q-icon name="layers" size="18px"/></a>
      <a class="flex-label link">{{ $t('names.layers') }}</a>
      <a class="flex-icon link">
        <q-icon
          v-show="!collapsed"
          flat round
          name="close"
          size="12px"
        />
      </a>
    </div>

    <div v-show="!collapsed">
      <ul v-if="baseLayerSelected">
        <li class="flex-nowrap-start link" @click="baseLayerSelect=!baseLayerSelect">
          <a class="flex-icon"
             ><q-icon size="1.5em" name="ion-globe" label="base layer"></q-icon></a>
          <a class="flex-label">{{ baseLayerSelected.name }}</a>
          <span class="flex-icon"></span>
          <span class="flex-icon"></span>
        </li>
      </ul>

      <ul v-show="!baseLayerSelected || baseLayerSelect">
        <li v-for="(layer, i) in baseLayers" :key="layer.id"
            class="flex-nowrap-start link"
            @click="setBaseLayer(i)">
          <a class="flex-icon option gray"
             ><q-icon color="grey" size="2em" name="keyboard_arrow_right" /></a>
          <a class="flex-label link">{{ layer.name }}</a>
        </li>
      </ul>

      <div v-show="layers.length > 0" class="sep"></div>

      <draggable
        v-model="layers"
        tag="ul"
        handle=".drag-handle"
      >
        <layer-item
          v-for="layer in layers"
          :key="key(layer)"
          :layer="layer"
          :map="map"
          :showActions="showActions"
          @remove-layer="removeLayer"
          @toggle-layer="toggleLayer"
          @change-opacity="changeOpacity"
        />
      </draggable>
    </div>
  </div>
</template>

<script>
import { QIcon } from 'quasar'
import { mapState } from 'vuex'

import L from '../lib/leaflet'
import draggable from 'vuedraggable'

import LayerItem from 'components/LayerItem.vue'

export default {
  components: {
    draggable,
    LayerItem,
    QIcon
  },
  data () {
    return {
      baseLayerSelect: false,
      collapsed: this.$q.screen.lt.md,
      showActions: false,
      layerLastId: 0,
      lastZIndex: 0
    }
  },
  computed: {
    baseLayers () {
      return this.$config.basemaps
    },
    ...mapState({
      map: state => state.map.mapObject,
      baseLayerSelected: state => state.map.layers.baseLayer
    }),
    layers: {
      get () {
        return this.$store.state.map.layers.overlays
      },
      set (value) {
        this.$store.dispatch('map/setOverlays', value)
      }
    }
  },
  mounted () {
    this.mapObject = new L.Control()
    this.mapObject.onAdd = this.onAdd
    this.mapObject.addTo(this.map)
  },
  methods: {
    setBaseLayer (i) {
      this.$store.dispatch('map/setBaseLayer', i)
      this.baseLayerSelect = false
    },
    onAdd () {
      L.DomEvent.disableClickPropagation(this.$el)
      return this.$el
    },
    removeLayer (overlay) {
      this.$store.dispatch('map/removeOverlay', overlay)
    },
    toggleLayer ({ overlay, visible }) {
      overlay.setVisible(visible)
    },
    changeOpacity ({ overlay, value }) {
      overlay.setOpacity(value)
    },
    key (overlay) {
      const id = overlay.id
      return id.toPlainRef ? id.toPlainRef() : id
    }
  }
}
</script>

<style lang="scss">
.giscube-layers-control {
  display: block;
  background-color: white;
  color: #212529;
  box-shadow: 0 4px 8px rgba(0,0,0,.3);
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

  div.layers-title {
    background: #0b1923;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    font-size: 1.3em;
    text-transform: uppercase;
    text-decoration: none;
    padding-right: 7px;

    a {
      color: white;
    }
  }

  a.configure:hover {
    color: #0b1923;
    background-color: white;
  }

  ul {
    list-style: none;
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    a {
      color: #212529;
    }
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
