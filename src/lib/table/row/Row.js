import L from 'src/lib/leaflet'
import { AsyncJob } from 'src/lib/async'
import MultiResult from 'src/lib/MultiResult'
import { some } from 'src/lib/itertools'
import { CancelError, createLayer, eachLayer, makeLayerSnapshot, applyLayerSnapshot } from 'src/lib/geomUtils'
import { delayPropertyDefinition, isCleanEqual } from 'src/lib/utils'
import { mergeRowsData } from './utils'

import Tooltip from '../Tooltip'

const EDIT_EVENTS = 'editable:dragstart editable:drawing:start editable:vertex:click editable:editing'

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

    if (parent.info.hasGeom) {
      Object.defineProperties(this, {
        _geomChanged: {
          configurable: false,
          enumerable: false,
          writable: false,
          value: this.geomChanged.bind(this)
        },
        layer: {
          configurable: true,
          enumerable: false,
          writable: true
        },
        tooltip: {
          configurable: true,
          enumerable: false,
          writable: true,
          value: new Tooltip(this)
        },
        consolidatedGeom: {
          configurable: true,
          enumerable: false,
          writable: true,
          value: null
        }
      })
    }
  }

  get info () {
    return this.parent.info
  }

  get internalPk () {
    return this.pk !== void 0 ? this.pk : this._internalPk
  }

  resetStatus () {
    this.status._deleted = false
    this.status._edited = false
    this.status.propsEdited = false
    this.status.geomEdited = false
    this.status.new = false

    this._updateModified()
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

  asNew () {
    if (this.info.hasGeom) {
      const promise = this._asNew.apply(this, arguments)
      this.parent.$root.$store.dispatch('layout/showMapWhile', promise)
      return promise
    } else {
      return this.clone()
    }
  }

  async _asNew ({ map }) {
    const config = {
      bubblingMouseEvents: false
    }
    if (this.info.shapeType === 'circle') {
      config.markerClass = L.CircleMarker
    }
    let layer
    try {
      layer = await createLayer({ map, type: this.info.geomType, config })
    } catch (e) {
      if (e instanceof CancelError && e.layer) {
        layer = e.layer
      } else {
        throw e
      }
    }
    const cloned = this.clone()
    cloned.layer = layer
    cloned.prepareLayer()
    return cloned
  }

  prepareLayer () {
    if (this.info.hasGeom) {
      this.applyStyle()
      this.layer.on('click', this.openPopup.bind(this))
    }
  }

  get fields () {
    return this.info.fields.values()
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

    if (this.info.hasGeom && !this.info.readonlyGeom && this.layer) {
      this.consolidatedGeom = makeLayerSnapshot(this.layer)
    }
  }

  clone () {
    const cloned = new this.constructor(this.parent, void 0, this.constFields)
    cloned.properties = this.properties
    return cloned
  }

  defineGeometry (data) {
    if (data && this.info.hasGeom) {
      delayPropertyDefinition(
        this,
        'geometry',
        () => this.info.geomPath.extractFrom(data)
      )
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
    this.applyStyle()
  }

  getEmpty () {
    return {}
  }

  _mergeProperties (other) {
    mergeRowsData(
      this.info.fields,
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
    if (!this.info.hasGeom) {
      return this
    }

    // Merge geom
    if (!this.geometry || !this.layer || !other.geometry) {
      this.remove()
      this.geometry = other.geometry
      this.add()
    } else {
      const otherLayer = L.GeoJSON.geometryToLayer(other.geometry, this.getGeomConfig())
      const otherGeomSnapshot = makeLayerSnapshot(otherLayer)

      if (!isCleanEqual(this.consolidatedGeom, otherGeomSnapshot)) {
        this.consolidatedGeom = otherGeomSnapshot
        if (!this.status.geomEdited) {
          applyLayerSnapshot(this.layer, this.consolidatedGeom)
        }
        this.geometry = other.geometry
        this.applyStyle()
      }
    }
    return this
  }

  propertiesFromData (data) {
    return this.info.propsPath.extractFrom(data)
  }

  revert () {
    if (this.status.geomEdited) {
      applyLayerSnapshot(this.layer, this.consolidatedGeom)
    }

    if (!this.status.new && this.status.propsEdited) {
      this._copyProperties()
    }
    this.resetStatus()
  }

  uiEdit (...args) {
    return this.parent.uiEdit([this], ...args)
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
    if (!this.info.hasGeom) {
      return
    }

    if (this.layer === void 0) {
      this.makeLayer()
    }
    if (this.layer) {
      this.layer.addTo(this.parent.layer)
    }
  }

  remove () {
    if (this.info.hasGeom && this.layer) {
      this.parent.layer.removeLayer(this.layer)
      this.layer.remove()
      this.layer = void 0
    }
  }

  addEditEvents () {
    if (!this.info.hasGeom || this.info.readonlyGeom) {
      return
    }

    eachLayer(this.layer, layer => layer.on(EDIT_EVENTS, this._geomChanged))
  }

  applyStyle ({ reactiveEmulation = false } = {}) {
    if (!this.info.hasGeom) {
      return
    }

    if (!(reactiveEmulation && this.info.geomStyle.reactive)) {
      this.info.geomStyle.apply(this)
    }
    this.tooltip.apply()
  }

  geomChanged () {
    if (this.status.geomEdited) {
      return
    }
    this.status.geomEdited = true
    this.status.edited = true
    this.applyStyle({ reactiveEmulation: true })
  }

  removeEditEvents () {
    if (!this.info.hasGeom || this.info.readonlyGeom) {
      return
    }

    eachLayer(this.layer, layer => layer.off(EDIT_EVENTS, this._geomChanged))
  }

  makeLayer () {
    if (this.geometry) {
      this.layer = L.GeoJSON.geometryToLayer(this.geometry, this.getGeomConfig())
      this.prepareLayer()
      this.consolidatedGeom = makeLayerSnapshot(this.layer)
    } else {
      this.layer = null
    }
  }

  getGeomConfig () {
    if (!this.info.hasGeom) {
      return
    }

    const config = {
      style: {
        bubblingMouseEvents: false
      }
    }
    if (this.info.shapeType === 'circle') {
      config.pointToLayer = (_, latlng) => L.circleMarker(latlng)
    }

    return config
  }

  openPopup ({ latlng }) {
    if (!this.info.hasGeom || !this.layer) {
      return
    }

    if (this.layer instanceof L.Marker || this.layer instanceof L.CircleMarker) {
      this.parent.popup.open(this.layer.getLatLng(), this)
    } else {
      this.parent.popup.open(latlng, this)
    }
  }
}
