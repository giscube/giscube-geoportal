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
    <svg viewBox="0 0 365 560"><use xlink:href="#marker" /></svg>
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
  </div>
</template>

<script>
export default {
  props: ['type', 'icon', 'fill', 'color', 'width', 'height', 'anchor', 'strokeColor']
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
  .marker > svg, .marker > object {
    z-index: unset;
    width: 100%;
    height: auto;
  }
</style>
