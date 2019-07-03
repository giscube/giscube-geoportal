<template>
  <div
    class="marker"
    :style="{
      width: width + 'px',
      height: anchor + 'px',
      margin: `-${anchor}px 0 0 -${width/2}px`,
      fill,
      color,
      stroke: strokeColor
    }"
  >
    <svg viewBox="0 0 155 200">
      <use xlink:href="#markerIcon" />
    </svg>
    <div
      :style="{
        width: width + 'px',
        height: width + 'px'
      }"
    >
      <q-img
        v-if="type === 'img'"
        :src="icon"
        :style="{
          width: iconSize + 'px',
          height: iconSize + 'px'
        }"
      />
      <q-icon
        v-else
        :name="icon"
        :size="iconSize + 'px'"
      />
    </div>
    <div
      v-if="leftStatusStyle"
      class="marker-status"
      :style="resultStyle('left', leftStatusStyle)"
    >
      <q-icon
        :name="leftStatusStyle.icon"
        :size="width * 0.35 + 'px'"
      />
    </div>
    <div
      v-if="rightStatusStyle"
      class="marker-status"
      :style="resultStyle('right', rightStatusStyle)"
    >
      <q-icon
        :name="rightStatusStyle.icon"
        :size="width * 0.35 + 'px'"
      />
    </div>

  </div>
</template>

<script>
import { QIcon, QImg } from 'quasar'
import { STATUS_STYLES } from '../utils'

export default {
  props: ['type', 'icon', 'fill', 'color', 'width', 'height', 'anchor', 'strokeColor', 'status'],
  components: {
    QIcon,
    QImg
  },
  computed: {
    iconSize () {
      return this.width * 0.5
    },
    leftStatusStyle () {
      return STATUS_STYLES.getByOrder(['selected'], this.status)
    },
    rightStatusStyle () {
      return STATUS_STYLES.getByOrder(['deleted', 'new', 'edited'], this.status)
    }
  },
  methods: {
    resultStyle (pos, statusStyle) {
      const result = {
        top: -this.width * 0.1 + 'px',
        width: this.width * 0.5 + 'px',
        height: this.width * 0.5 + 'px',
        'border-style': 'solid',
        'border-width': this.width * 0.03 + 'px',
        'background-color': statusStyle.fill,
        'border-color': statusStyle.stroke
      }
      pos = (pos === 'right' ? pos : 'left')
      result[pos] = -this.width * 0.1 + 'px'
      return result
    }
  }
}
</script>

<style>
  .marker {
    overflow-y: visible;
    position: relative;
    top: 0;
    left: 0;
    pointer-events: none; /* Only the symbol should have the events. See IconsGenerator.vue */
  }
  .marker > * {
    position: absolute;
  }
  .marker > div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  .marker > svg {
    z-index: unset;
    width: 100%;
    height: auto;
    stroke-width: 8;
  }

  .marker-status {
    border-radius: 50%;
  }
</style>
