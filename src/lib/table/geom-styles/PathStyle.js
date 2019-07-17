import GeomStyle from './Base'
import { toNumber, STATUS_STYLES } from './utils'

class PathStyle extends GeomStyle {
  getDefaultStyle () {
    return {
      weight: 1,
      color: '#FF3333',
      opacity: 1,
      fillColor: '#FFC300',
      fillOpacity: 1
    }
  }

  fromInfo (info) {
    return {
      weight: toNumber(info.stroke_width),
      color: info.stroke_color,
      opacity: toNumber(info.stroke_opacity),
      fillColor: info.fill_color,
      fillOpacity: toNumber(info.fill_opacity)
    }
  }

  applyStyle (row, style) {
    // Also used by CircleStyle

    // Set style based on the geometry status
    const statusStyle = STATUS_STYLES.get(row.status)
    if (statusStyle) {
      style.fillColor = statusStyle.fill
      style.color = statusStyle.stroke
    }

    // apply it
    row.layer.setStyle({
      ...style,
      bubblingMouseEvents: false
    })
  }

  _apply (row) {
    this.applyStyle(row, this.generate(row))
  }
}

export { PathStyle as default, PathStyle }
