import Vue from 'vue'
import MapPopup from 'components/data-layer/MapPopup'
import L from 'src/lib/leaflet'
import { INTERNAL_PROPERTY } from 'src/lib/utils'

const PopupContent = Vue.extend(MapPopup)

export default class Popup {
  constructor (root) {
    const container = L.popup({
      closeOnClick: true,
      closeOnEscapeKey: true
    })

    const content = new PopupContent({
      parent: root,
      data: {
        row: null
      }
    })
    content.$mount()

    container.setContent(content.$el)
    content.$on('update-popup-size', _ => {
      container.update()
    })

    this.current = null

    // Define internals
    // We really, really do no want Vue getting in there
    const internal = {
      $root: root,
      content,
      container,
      query: {
        latlng: null
      },
      onClosePopup: () => {
        this.$root.$store.dispatch('removeQuery', this.query)
      }
    }
    Object.keys(internal).forEach(key => {
      Object.defineProperty(this, key, {
        ...INTERNAL_PROPERTY,
        value: internal[key]
      })
    })
  }

  getLatLng () {
    return this.container && this.container.getLatLng()
  }

  isOpen () {
    return (!!this.container) && this.container.isOpen()
  }

  open (latlng, row) {
    if (this.current) {
      this.current.off('popupclose', this.onClosePopup)
      this.current.closePopup()
      this.current.unbindPopup()
    }
    this.current = row.layer
    if (this.current) {
      Vue.set(this.content, 'row', row)

      Vue.nextTick(() => {
        this.container.update()
        this.current.bindPopup(this.container)
        this.current.openPopup(latlng)
        this.query.latlng = latlng
        this.current.on('popupclose', this.onClosePopup)
        this.$root.$store.commit('setQuery', this.query)
      })
    }
  }
}
