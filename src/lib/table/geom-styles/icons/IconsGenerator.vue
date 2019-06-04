<template functional>
  <svg id="IconsGeneratorVm" style="display: none">
    <symbol id="markerIcon" viewBox="-28 -13 155 200">
      <path d="M 42.796846,171.74815 C -7.2660506,99.171809 -16.558652,91.723255 -16.558652,65.05035 c 0,-36.53609 29.618124,-66.1542163 66.154214,-66.1542163 36.53609,0 66.154218,29.6181263 66.154218,66.1542163 0,26.672905 -9.2926,34.121459 -59.355502,106.6978 -3.285318,4.74586 -10.312482,4.74553 -13.597432,0 z" />
    </symbol>
  </svg>
</template>

<script>
import Vue from 'vue'
import L from 'src/lib/leaflet'
import { standarizeColour, colorLuminance } from 'src/lib/color-utils'
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

const HEIGHT_RATIO = 200 / 155
const ANCHOR_RATIO = 186.45 / 155
// const ICON_RATIO = 0.5

let _vm
function ensureExistance () {
  if (_vm) {
    return
  }

  // Based on Quasar's global dialogs
  // Create div to replace the component with
  const el = document.createElement('div')
  document.body.appendChild(el)

  // Make the vm (in the div)
  _vm = new Vue({
    el,
    render: h => h(Component)
  })
}

const Component = {
  icon ({ type = 'preset', fill = '#f00', icon = 'fas fa-camera', color = 'black', size = 20, status = {} } = {}) {
    ensureExistance()
    return new MarkerIcon({
      props: {
        type,
        fill,
        strokeColor: ensure(fill, _ => colorLuminance(standarizeColour(fill), -0.20)),
        icon,
        color,
        size,
        width: size,
        height: ensure(size, _ => (size * HEIGHT_RATIO)),
        anchor: ensure(size, _ => (size * ANCHOR_RATIO)),

        status
      },
      popupAnchor: ensure(size, _ => ([0, -size * ANCHOR_RATIO]))
    })
  },
  imgIcon (style) {
    ensureExistance()
    return L.icon({
      iconUrl: style.icon,
      iconSize: style.sizes,
      iconAnchor: style.sizes.map(x => x / 2)
    })
  }
}

export default Component
</script>
