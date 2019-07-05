import { getGeometry } from 'src/lib/geoJson'
import { isCleanEqual } from 'src/lib/utils'
import MultiResult from 'src/lib/MultiResult'

const pkGenerator = (function () {
  let n = 0
  return {
    next () {
      return {
        value: Symbol('new__' + n++),
        done: false
      }
    }
  }
})()

export default class Row {
  constructor (parent, data, constFields = {}) {
    // Set internal components.
    // I made them non enumerable because it's very likely to make circular dependencies
    Object.defineProperties(this, {
      data: {
        configurable: false,
        enumerable: false,
        writable: true,
        value: data || this.getEmpty()
      },
      parent: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: parent
      }
    })

    Object.defineProperties(this, {
      _internalPk: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: this.pk === void 0 ? pkGenerator.next().value : void 0
      }
    })

    const self = this
    this.status = {
      _deleted: false,
      edited: false,
      propsEdited: false,
      geomEdited: false,
      get selected () {
        return self.parent.selectedList.includes(self.internalPk)
      },
      set selected (value) {
        self.parent.selectRows([self], { added: !!value })
      },
      new: !data
    }

    Object.defineProperty(this.status, 'deleted', {
      get: () => this.status._deleted,
      set: value => {
        this.status._deleted = value
        this.applyStyle()
        return value
      }
    })

    this.properties = {
      ...this.getOriginalProperties(),
      ...constFields
    }
    // updates data to contain the constFields
    this.info.propsPath.setTo(this.data, this.properties)
  }

  get geometry () {
    if (this.info.hasGeom) {
      return this.info.geomPath.extractFrom(this.data)
    }
  }

  get info () {
    return this.parent.info
  }

  get internalPk () {
    return this.pk !== void 0 ? this.pk : this._internalPk
  }

  resetStatus () {
    this.status.deleted = false
    this.status.edited = false
    this.status.propsEdited = false
    this.status.geomEdited = false

    this.applyStyle()
  }

  applyStyle () {}

  async asNew () {
    return this.clone()
  }

  clone () {
    const cloned = new this.constructor(this.parent)
    cloned.properties = this.properties
    return cloned
  }

  diff () {
    const result = this.getEmpty()
    if (this.status.propsEdited) {
      const orig = this.getOriginalProperties()
      const properties = {}
      this.parent.info.fields.forEach(field => {
        const o = field.repr({ properties: orig })
        const n = field.repr({ properties: this.properties })
        if (!isCleanEqual(o, n)) {
          properties[field.name] = n
        }
      })
      this.info.propsPath.setTo(result, properties)
    }
    if (this.info.hasGeom && this.status.geomEdited) {
      this.info.geomPath.setTo(result, getGeometry(this.layer, this.info.geomType))
    }
    this.setPk(result, this.pk)
    return result
  }

  edit (properties) {
    const props = {}
    Object.keys(properties).forEach(key => {
      const value = properties[key]
      if (!MultiResult.is(value)) {
        props[key] = value
      }
    })
    this.properties = {
      ...this.properties,
      ...props
    }
    this.status.edited = true
    this.status.propsEdited = true
  }

  getEmpty () {
    return {}
  }

  getOriginalProperties () {
    return this.info.propsPath.extractFrom(this.data)
  }

  merge (other) {
    return other
  }

  repr () {
    const result = this.getEmpty()
    const props = {}
    this.parent.info.fields.forEach(field => {
      props[field.name] = field.repr({ properties: this.properties })
    })
    this.info.propsPath.setTo(result, props)
    if (this.info.hasGeom) {
      this.info.geomPath.setTo(result, getGeometry(this.layer, this.info.geomType))
    }
    this.setPk(result, this.pk)
    return result
  }

  revert () {
    if (!this.status.new && this.status.propsEdited) {
      this.properties = this.getOriginalProperties()
    }
    this.resetStatus()
  }

  uiEdit () {
    return this.parent.uiEdit([this])
  }

  add (group) {
    // do nothing
  }

  remove () {
    // do nothing
  }
}
