<template>
  <div>
    <div class="q-py-sm">
      <q-item>
        <q-item-section>
          <q-item-label>{{ $t('names.opacity') | capitalize }}</q-item-label>
        </q-item-section>
        <q-item-section top side>
          <div>
            {{ toPercent(opacity) }}%
          </div>
        </q-item-section>
      </q-item>
      <q-item>
      <q-slider
        :min="0"
        :max="100"
        :value="opacity * 100"
        @input="value => opacity = value"
      />
      </q-item>
    </div>
    <div v-if="layer && layer.getContainer">
      <q-item>
        <q-item-section>
          <q-item-label>{{ $t('actions.clip') | capitalize }} {{ $t('names.vertically') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-range
          :min="0"
          :max="100"
          :value="clipPercentX"
          @input="changeClipX"
        />
      </q-item>
    </div>
    <div v-if="layer && layer.getContainer">
      <q-item>
        <q-item-section>
          <q-item-label>{{ $t('actions.clip') | capitalize }} {{ $t('names.horizontally') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-range
          :min="0"
          :max="100"
          :value="clipPercentY"
          @input="changeClipY"
        />
      </q-item>
    </div>
  </div>
</template>

<script>
import { QItem, QItemSection, QItemLabel, QRange, QSlider } from 'quasar'
import { mapState } from 'vuex'

export default {
  props: ['layer'],
  components: {
    QItem,
    QItemSection,
    QItemLabel,
    QRange,
    QSlider
  },
  data () {
    return {
      clipPercentX: (this.layer.options && this.layer.options.clipPercentX) || { min: 0, max: 100 },
      clipPercentY: (this.layer.options && this.layer.options.clipPercentY) || { min: 0, max: 100 }
    }
  },
  computed: {
    ...mapState({
      map: state => state.map.mapObject
    }),
    opacity: {
      get () {
        return (this.layer.options && this.layer.options.opacity) || this.layer.getLayers()[0].options.opacity || 1
      },
      set (value) {
        if (this.layer.options && this.layer.options.opacity) {
          this.layer.setOpacity(value / 100)
        } else if (this.layer.getLayers()[0].options.opacity) {
          this.layer.eachLayer(layer => {
            layer.setStyle({ opacity: value / 100, fillOpacity: value / 100 })
          })
        }
      }
    }
  },
  methods: {
    clip () {
      const layer = this.layer
      const map = this.map
      const northWest = map.containerPointToLayerPoint([0, 0])
      const southEast = map.containerPointToLayerPoint(map.getSize())
      const clipLeft = northWest.x + (southEast.x - northWest.x) * this.clipPercentX.min / 100
      const clipRight = northWest.x + (southEast.x - northWest.x) * this.clipPercentX.max / 100
      const clipBottom = southEast.y + (northWest.y - southEast.y) * this.clipPercentY.min / 100
      const clipTop = southEast.y + (northWest.y - southEast.y) * this.clipPercentY.max / 100
      layer.getContainer().style.clip = 'rect(' + [clipTop, clipRight, clipBottom, clipLeft].join('px,') + 'px)'
      layer.options.clipPercentX = this.clipPercentX
      layer.options.clipPercentY = this.clipPercentY
    },
    changeClipX ({ min, max }) {
      this.clipPercentX = { min, max }
      this.map.on('move', this.clip)
      this.clip()
    },
    changeClipY ({ min, max }) {
      this.clipPercentY = { min, max }
      this.map.on('move', this.clip)
      this.clip()
    },
    toPercent (value) {
      return Math.round(value * 10000) / 100
    }
  }
}
</script>
