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
    content.$on('updatePopupSize', _ => container.update())

    this.current = null

    // Define internals
    // We really, really do no want Vue getting in there
    const internal = {
      content,
      container
    }
    Object.keys(internal).forEach(key => {
      Object.defineProperty(this, key, {
        ...INTERNAL_PROPERTY,
        value: internal[key]
      })
    })
  }

  open (latlng, row) {
    if (this.current) {
      this.current.closePopup()
      this.current.unbindPopup()
    }
    this.current = row.layer
    if (this.current) {
      Vue.set(this.content, 'row', row)
      this.current.bindPopup(this.container)
      this.current.openPopup(latlng)
    }
  }
}
