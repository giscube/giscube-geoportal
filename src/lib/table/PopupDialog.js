import Vue from 'vue'
import MapPopupDialog from 'components/data-layer/MapPopupDialog'
import { INTERNAL_PROPERTY } from 'src/lib/utils'

const Dialog = Vue.extend(MapPopupDialog)

export default class Popup {
  constructor (root) {
    Object.defineProperty(this, '$root', {
      ...INTERNAL_PROPERTY,
      value: root
    })
  }

  open (latlng, row) {
    this.$root.$store.dispatch('layout/createDialog', {
      component: Dialog,
      row
    })
  }
}
