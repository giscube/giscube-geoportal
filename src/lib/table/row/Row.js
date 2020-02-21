import { AsyncJob } from 'src/lib/async'
import MultiResult from 'src/lib/MultiResult'
import { some } from 'src/lib/itertools'
import { delayPropertyDefinition } from 'src/lib/utils'
import { mergeRowsData } from './utils'

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
    Object.defineProperties(this, {
      parent: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: parent
      },
      data: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: data
      },
      _saveJobs: {
        configurable: true,
        enumerable: false,
        writable: true,
        value: []
      }
    })
    this.constFields = constFields
    this.serverProperties = this.consolidatedProperties = data ? this.propertiesFromData(data) : {}
    this.properties = null

    this.defineGeometry(data)

    this.generatePk(data)
    Object.defineProperties(this, {
      _internalPk: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: this.pk === void 0 ? pkGenerator.next().value : void 0
      }
    })

    this._copyProperties()

    // TODO: move status logic into another class for readability
    const row = this
    this.status = {
      _hasBeenModified: false,
      _deleted: false,
      _edited: false,
      get edited () {
        return this._edited
      },
      set edited (value) {
        this._edited = value
        row._updateModified()
        return this._edited
      },
      propsEdited: false,
      geomEdited: false,
      saving: false,
      get selected () {
        return row.parent.selectedList.includes(row.internalPk)
      },
      set selected (value) {
        row.parent.selectRows([row], { added: !!value })
      },
      new: !data,
      transient: false
    }

    Object.defineProperty(this.status, 'deleted', {
      get: () => this.status._deleted,
      set (value) {
        this._deleted = value
        row._updateModified()
        row.applyStyle()
        return value
      }
    })
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
    this.status.new = false

    this.applyStyle()
  }

  addNew () {
    this.status._hasBeenModified = false
    this._updateModified()
    this.add()
  }

  addSaveJob (saveJob) {
    this._saveJobs.unshift(saveJob)
    this._saveJobs = this._saveJobs.filter(job => !job.done)

    saveJob.finally(_ => this.updateSaving())
    this.updateSaving()
  }

  applyStyle () {}

  async asNew () {
    return this.clone()
  }

  get fields () {
    return this.parent.info.fields.values()
  }

  * _asyncValues () {
    for (let field of this.fields) {
      const value = field.getValue({ row: this })
      if (AsyncJob.is(value)) {
        yield value
      }
    }
  }

  get asyncValues () {
    return this._asyncValues()
  }

  * _dependencies () {
    yield * this._saveJobs
    yield * this._asyncValues()
  }

  get dependencies () {
    return this._dependencies()
  }

  _copyProperties () {
    this.properties = { ...this.consolidatedProperties }
  }

  consolidateChanges () {
    for (let value of this.asyncValues) {
      value.incrementReference(Infinity)
    }
    this.consolidatedProperties = this.properties
    this._copyProperties()
  }

  clone () {
    const cloned = new this.constructor(this.parent)
    cloned.properties = this.properties
    return cloned
  }

  defineGeometry (data) {
    if (data && this.info.hasGeom) {
      if (this.info.ownData) {
        this.geometry = this.info.geomPath.extractFrom(data)
      } else {
        delayPropertyDefinition(
          this,
          'geometry',
          () => this.info.geomPath.extractFrom(data)
        )
      }
    }
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

  _mergeProperties (other) {
    mergeRowsData(
      this.parent.info.fields,
      [
        this.serverProperties,
        this.consolidatedProperties,
        this.properties
      ],
      other.serverProperties
    )
  }

  merge (other) {
    this._mergeProperties(other)
    return this
  }

  propertiesFromData (data) {
    return this.info.propsPath.extractFrom(data)
  }

  revert () {
    if (!this.status.new && this.status.propsEdited) {
      this._copyProperties()
    }
    this.resetStatus()
  }

  uiEdit () {
    return this.parent.uiEdit([this])
  }

  _updateModified () {
    const n = this.status.edited || this.status._deleted || this.status.new
    if (this.status._hasBeenModified !== n) {
      this.status._hasBeenModified = n
      if (this.parent.rows.includes(this)) {
        this.parent.changedCount += n ? 1 : -1
      }
    }
  }

  updateSaving () {
    this.status.saving = some(this._saveJobs, job => !job.done)
  }

  updateTransient () {
    this.status.transient = this.parent.transients.has(this)
  }

  add () {
    // do nothing
  }

  remove () {
    // do nothing
  }
}
