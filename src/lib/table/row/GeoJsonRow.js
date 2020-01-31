import L from 'src/lib/leaflet'
import { CancelError, createLayer, eachLayer, makeLayerSnapshot, applyLayerSnapshot } from 'src/lib/geomUtils'
import { isCleanEqual } from 'src/lib/utils'

import Tooltip from '../Tooltip'
import Row from './Row'

const EDIT_EVENTS = 'editable:dragstart editable:drawing:start editable:vertex:click editable:editing'

export default class GeoJsonRow extends Row {
  constructor (parent, data) {
    super(parent, data)

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

  generatePk (data) {
    this.pk = data && data.id
  }

  getEmpty () {
    return {
      type: 'Feature',
      properties: {}
    }
  }

  add () {
    if (this.layer === void 0) {
      this.makeLayer()
    }
    if (this.layer) {
      this.layer.addTo(this.parent.layer)
    }
  }

  addEditEvents () {
    if (this.info.readonlyGeom) {
      return
    }

    eachLayer(this.layer, layer => layer.on(EDIT_EVENTS, this._geomChanged))
  }

  applyStyle ({ reactiveEmulation = false } = {}) {
    if (!(reactiveEmulation && this.parent.info.geomStyle.reactive)) {
      this.parent.info.geomStyle.apply(this)
    }
    this.tooltip.apply()
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
    const cloned = super.clone()
    cloned.layer = layer
    cloned.prepareLayer()
    return cloned
  }

  asNew () {
    const promise = this._asNew.apply(this, arguments)
    this.parent.$root.$store.dispatch('layout/showMapWhile', promise)
    return promise
  }

  consolidateChanges () {
    super.consolidateChanges()
    if (this.layer) {
      this.consolidatedGeom = makeLayerSnapshot(this.layer)
    }
  }

  copyPk (obj, pk) {
    obj.id = pk
  }

  edit (properties) {
    super.edit(properties)
    this.applyStyle()
  }

  geomChanged () {
    this.removeEditEvents()
    this.status.geomEdited = true
    this.status.edited = true
    this.applyStyle({ reactiveEmulation: true })
  }

  getGeomConfig () {
    const config = {
      style: {
        bubblingMouseEvents: false
      }
    }
    if (this.parent.info.shapeType === 'circle') {
      config.pointToLayer = (_, latlng) => L.circleMarker(latlng)
    }

    return config
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

  merge (other) {
    this._mergeProperties(other)
    if (!this.geometry || !this.layer || !other.geometry) {
      this.geometry = other.geometry
      this.makeLayer()
    } else {
      const otherLayer = L.GeoJSON.geometryToLayer(other.geometry, this.getGeomConfig())
      const otherGeomSnapshot = makeLayerSnapshot(otherLayer)

      if (!isCleanEqual(this.consolidatedGeom, otherGeomSnapshot)) {
        this.consolidatedGeom = otherGeomSnapshot
        if (!this.status.geomEdited) {
          applyLayerSnapshot(this.layer, this.consolidatedGeom)
        }
        this.geometry = other.geometry
      }
    }
    return this
  }

  openPopup ({ latlng }) {
    if (this.layer instanceof L.Marker || this.layer instanceof L.CircleMarker) {
      this.parent.popup.open(this.layer.getLatLng(), this)
    } else {
      this.parent.popup.open(latlng, this)
    }
  }

  prepareLayer () {
    this.applyStyle()
    this.layer.on('click', this.openPopup.bind(this))
    this.addEditEvents()
  }

  remove () {
    if (this.layer) {
      this.parent.layer.removeLayer(this.layer)
      this.layer.remove()
      delete this.layer
    }
  }

  removeEditEvents () {
    eachLayer(this.layer, layer => layer.off(EDIT_EVENTS, this._geomChanged))
  }

  revert () {
    this.revertLayer()
    super.revert()
  }

  revertLayer () {
    if (this.status.geomEdited) {
      applyLayerSnapshot(this.layer, this.consolidatedGeom)
      this.addEditEvents()
    }
  }

  setPk (pk) {
    this.pk = pk
  }
}
