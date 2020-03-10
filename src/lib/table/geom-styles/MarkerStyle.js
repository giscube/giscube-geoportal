import { eachLayer } from 'src/lib/geomUtils'
import GeomStyle from './Base'
import { toNumber } from './utils'
import IconsGenerator from './icons/IconsGenerator'

class MarkerStyle extends GeomStyle {
  getDefaultStyle () {
    return {
      type: 'preset',
      fill: 'blue',
      icon: 'fas fa-circle',
      color: 'white',
      size: 34
    }
  }

  fromInfo (info) {
    return {
      type: info.icon_type === 'img' ? 'img' : 'preset',
      fill: info.fill_color || info.marker_color,
      icon: info.icon,
      color: info.icon_color,
      size: toNumber(info.size)
    }
  }

  _apply (row) {
    eachLayer(row.layer, layer => {
      layer.setIcon(
        IconsGenerator.icon({
          ...this.generate(row),
          status: row.status
        })
      )
    })
  }

  get reactive () {
    return true
  }
}

export { MarkerStyle as default, MarkerStyle }
