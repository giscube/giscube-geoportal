import Vue from 'vue'
import MapTooltip from 'components/data-layer/MapTooltip'
import L from 'src/lib/leaflet'
import { INTERNAL_PROPERTY } from 'src/lib/utils'

const Content = Vue.extend(MapTooltip)

export default class Tooltip {
  constructor (row) {
    if (!row.parent.info.tooltipTemplate) {
      return
    }

    const container = L.tooltip({
      sticky: true,
      opacity: 1
    })

    const content = new Content({
      parent: row.parent.$root,
      propsData: {
        row
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
      container,
      row
    }
    Object.keys(internal).forEach(key => {
      Object.defineProperty(this, key, {
        ...INTERNAL_PROPERTY,
        value: internal[key]
      })
    })
  }

  apply () {
    if (this.container) {
      this.row.layer.bindTooltip(this.container)
    }
  }
}
