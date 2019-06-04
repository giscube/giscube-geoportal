import GeomStyle from './Base'
import { toNumber } from './utils'

class PathStyle extends GeomStyle {
  getDefaultStyle () {
    return {
      weight: 1,
      color: '#FF3333',
      fillColor: '#FFC300',
      fillOpacity: 1
    }
  }

  fromInfo (info) {
    return {
      weight: toNumber(info.stroke_width),
      color: info.stroke_color,
      fillColor: info.fill_color,
      fillOpacity: toNumber(info.fill_opacity)
    }
  }

  applyStyle (row, style) {
    // Also used by CircleStyle
    row.layer.setStyle({
      ...style,
      opacity: 1,
      bubblingMouseEvents: false
    })
  }

  apply (row) {
    this.applyStyle(row, this.generate(row))
  }
}

export { PathStyle as default, PathStyle }
