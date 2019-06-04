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

  apply (row) {
    const style = this.generate(row)
    this.applyStyle(row, style)
    if (row.layer.setRadius && style.radius !== void 0 && style.radius !== null) {
      row.layer.setRadius(style.radius)
    }
  }
}

export { CircleStyle as default, CircleStyle }
