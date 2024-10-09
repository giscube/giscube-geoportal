<template>
<div>
  <q-select
    filled
    v-model="mapType"
    hint="Indica el camp per definir el pes de cada punt"
    :options="options"
    class="q-mb-md"
  >
    <template slot="append">
      <q-btn
        v-show="mapType"
        flat
        icon="close"
        @click="mapType = null"
      />
    </template>
  </q-select>
  <q-item>
    <q-item-section>
      <q-item-label>{{ $t('tools.heatMap.radius') | capitalize }}</q-item-label>
    </q-item-section>
    <q-item-section top side>
      <div>
        {{ radius }}
      </div>
    </q-item-section>
  </q-item>
  <q-item>
    <q-slider v-model="radius" :min="0" :max="50"/>
  </q-item>
  <q-item>
    <q-item-section>
      <q-item-label>{{ $t('tools.heatMap.blur') | capitalize }}</q-item-label>
    </q-item-section>
    <q-item-section top side>
      <div>
        {{ blur * 2 }}%
      </div>
    </q-item-section>
  </q-item>
  <q-item>
    <q-slider v-model="blur" :min="0" :max="50"/>
  </q-item>
  <q-item>
    <q-item-section>
      <q-item-label>{{ $t('tools.heatMap.intensity') | capitalize }}</q-item-label>
    </q-item-section>
    <q-item-section top side>
      <div>
        {{ Math.round(opacity * 100) }}%
      </div>
    </q-item-section>
  </q-item>
  <q-item>
    <q-slider v-model="opacity" :min="0" :max="1" :step="0.01"/>
  </q-item>
</div>
</template>

<script>
import { QBtn, QItem, QItemSection, QItemLabel, QSelect, QSlider } from 'quasar'
import L from 'src/lib/leaflet'

export default {
  props: ['layer', 'tab'],
  components: {
    QBtn, QItem, QItemSection, QItemLabel, QSelect, QSlider
  },
  beforeDestroy () {
    this.removeHeatLayer()
  },
  data () {
    return {
      heatLayer: null,
      radius: 20,
      blur: 25,
      opacity: 0.5,
      mapType: this.$t('tools.heatMap.defaultOption')
    }
  },
  computed: {
    propertiesNames () {
      if (this.layer.getLayers().length > 0) {
        return Object.keys(this.layer.getLayers()[0].feature.properties)
      }
      return []
    },
    map () {
      return this.$store.state.map.mapObject
    },
    options () {
      if (this.layer) {
        return [
          this.$t('tools.heatMap.defaultOption'),
          ...this.propertiesNames
        ]
      } else {
        return []
      }
    },
    max () {
      if (this.mapType === this.$t('tools.heatMap.defaultOption')) {
        return 5
      } else {
        const values = this.layer.getLayers().map(layer => {
          const value = parseFloat(layer.feature.properties[this.mapType])
          if (isNaN(value)) {
            return -Infinity
          } else {
            return value
          }
        })
        return values.reduce((a, b) => Math.max(a, b), -Infinity)
      }
    }
  },
  methods: {
    removeHeatLayer () {
      if (this.heatLayer !== null) {
        this.map.removeLayer(this.heatLayer)
        this.heatLayer = null
      }
    },
    addHeatLayer () {
      const layers = this.layer && this.layer.getLayers()
      let coords = null
      if (layers && layers[0].feature && layers[0].feature.geometry && (layers[0].feature.geometry.type === 'Point' || layers[0].feature.geometry.type === 'MultiPoint')) {
        coords = layers.map(layer => {
          const _coords = layer.feature.geometry.type === 'Point' ? [layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]] : [layer.feature.geometry.coordinates[0][1], layer.feature.geometry.coordinates[0][0]]
          if (this.mapType !== this.$t('tools.heatMap.defaultOption')) {
            return [..._coords, layer.feature.properties[this.mapType] / this.max]
          } else {
            return [..._coords, this.max]
          }
        })
      }
      if (coords) {
        this.heatLayer = L.heatLayer(coords, {
          radius: this.radius,
          blur: this.blur,
          minOpacity: this.opacity,
          max: 1,
          gradient: {
            0.14: '#009392',
            0.28: '#39b185',
            0.42: '#9ccb86',
            0.56: '#e9e29c',
            0.60: '#eeb479',
            0.74: '#e88471',
            1: '#cf597e'
          }
        })
        this.heatLayer.addTo(this.map)
      }
    },
    updateHeatLayer () {
      this.removeHeatLayer()
      if (this.mapType) {
        this.addHeatLayer()
      }
    }
  },
  watch: {
    mapType: ['updateHeatLayer'],
    radius: ['updateHeatLayer'],
    blur: ['updateHeatLayer'],
    opacity: ['updateHeatLayer'],
    tab (val) {
      if (val === 'heat-map') {
        this.updateHeatLayer()
      } else {
        this.removeHeatLayer()
      }
    }
  }
}
</script>

<style>

</style>
