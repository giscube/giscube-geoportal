<template functional>
  <svg style="display: none">
    <symbol id="markerIcon" viewBox="-10 -10 120 195.39214">
      <path d="M4.147 69.93745 A50 50 0 1 1 95.853 69.93745 L50 175.39214 Z" />
    </symbol>
  </svg>
</template>

<script>
import Vue from 'vue'
import L from '../../lib/leaflet'
import MarkerClass from './Marker'

const Marker = Vue.extend(MarkerClass)
const MarkerIcon = L.Icon.extend({
  options: {
    props: {
      fill: null,
      strokeColor: null,
      icon: null,
      color: null,
      size: null,
      width: null,
      height: null,
      anchor: null,
      status: null
    }
  },
  initialize (options) {
    options = L.Util.setOptions(this, options)
  },
  createIcon (oldElement) {
    if (!this._marker) {
      this._marker = new Marker({
        propsData: this.options.props
      }).$mount()
    }
    return this._marker.$el
  },
  createShadow () {
    return null
  }
})

function ensure (value, callback) {
  return value !== undefined && value !== null ? callback(value) : undefined
}

function colorLuminance (hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '')
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  lum = lum || 0

  // convert to decimal and change luminosity
  let rgb = '#', c, i
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16)
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
    rgb += ('00' + c).substr(c.length)
  }

  return rgb
}

const HEIGHT_RATIO = 195.39214 / 120
const ANCHOR_RATIO = 185.39214 / 120
// const ICON_RATIO = 0.5

export default {
  icon ({ type = 'preset', fill = '#f00', icon = 'fas fa-camera', color = 'black', size = 20, status = {} } = {}) {
    return new MarkerIcon({
      props: {
        type,
        fill,
        strokeColor: ensure(fill, _ => colorLuminance(fill, -0.20)),
        icon,
        color,
        size,
        width: size,
        height: ensure(size, _ => (size * HEIGHT_RATIO)),
        anchor: ensure(size, _ => (size * ANCHOR_RATIO)),

        status
      }
    })
  },
  imgIcon (style) {
    return L.icon({
      iconUrl: style.icon,
      iconSize: style.sizes,
      iconAnchor: style.sizes.map(x => x / 2)
    })
  }
}
</script>
