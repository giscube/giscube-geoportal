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
    <svg viewBox="0 0 120 195.39214">
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
          width: width * 0.5 + 'px',
          height: width * 0.5 + 'px'
        }"
      />
      <q-icon
        v-else
        :name="icon"
        :size="width * 0.5 + 'px'"
      />
    </div>
    <div
      v-show="status.selected"
      class="marker-status"
      :style="statusStyle('left', ['#3f82af', '#285370'])"
    >
      <q-icon
        name="check"
        :size="width * 0.35 + 'px'"
      />
    </div>
    <div
      v-if="statusColor"
      class="marker-status"
      :style="statusStyle('right', statusColor)"
    >
      <q-icon
        :name="statusIcon"
        :size="width * 0.35 + 'px'"
      />
    </div>

  </div>
</template>

<script>
import { QIcon, QImg } from 'quasar'

export default {
  props: ['type', 'icon', 'fill', 'color', 'width', 'height', 'anchor', 'strokeColor', 'status'],
  components: {
    QIcon,
    QImg
  },
  computed: {
    statusColor () {
      if (this.status.deleted) {
        return ['#ad3e3e', '#6d2727']
      } else if (this.status.new) {
        return ['#45b240', '#2c7229']
      } else if (this.status.modified) {
        return ['#ad8f3e', '#6b5826']
      }
      return null
    },
    statusIcon () {
      if (this.status.deleted) {
        return 'close'
      } else if (this.status.new) {
        return 'add'
      } else if (this.status.modified) {
        return 'edit'
      }
      return null
    }
  },
  methods: {
    statusStyle (pos, color) {
      const result = {
        top: -this.width * 0.1 + 'px',
        width: this.width * 0.5 + 'px',
        height: this.width * 0.5 + 'px',
        'border-style': 'solid',
        'border-width': this.width * 0.03 + 'px',
        'background-color': color[0],
        'border-color': color[1]
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
    /* background-color: yellow; */
    overflow-y: visible;
    position: relative;
    top: 0;
    left: 0;
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
