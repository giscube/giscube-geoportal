import { eachLayer } from 'src/lib/geomUtils'
import PathStyle from './PathStyle'
import { toNumber } from './utils'

class CircleStyle extends PathStyle {
  getDefaultStyle () {
    return {
      ...super.getDefaultStyle(),
      radius: 10
    }
  }

  fromInfo (info) {
    return {
      ...super.fromInfo(info),
      radius: toNumber(info.shape_radius)
    }
  }

  _apply (row) {
    const style = this.generate(row)
    this.applyStyle(row, style)
    eachLayer(row.layer, layer => {
      if (layer.setRadius && style.radius !== void 0 && style.radius !== null) {
        layer.setRadius(style.radius)
      }
    })
  }
}

export { CircleStyle as default, CircleStyle }
