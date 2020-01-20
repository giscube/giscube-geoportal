import DottedPath from 'src/lib/DottedPath'
import { isVoid } from 'src/lib/utils'

export default class GeomPath {
  constructor (path) {
    if (typeof path === 'string' || path instanceof String) {
      this.ref = new DottedPath(path)
    } else {
      this.ref = path
    }
    this.isLeaf = this.ref instanceof DottedPath
  }

  extractFrom (data) {
    if (this.isLeaf) {
      return this.ref.extractFrom(data)
    } else {
      const relatedTable = this.ref
      const path = relatedTable.info.geomPath
      const properties = relatedTable.parent.info.propsPath.extractFrom(data)
      const id = relatedTable.fk.getValue({ properties })
      const row = relatedTable.getRow(id)
      if (!isVoid(path) && row) {
        return path.extractFrom(row.data)
      }
    }
  }
}
