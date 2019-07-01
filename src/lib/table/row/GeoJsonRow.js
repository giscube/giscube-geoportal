import L from 'src/lib/leaflet'
import { CancelError, createLayer, eachLayer, flipLatLng, makeLayerReverter } from 'src/lib/geomUtils'

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
      }
    })
  }

  get pk () {
    return this.data ? this.data.id : void 0
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
    eachLayer(this.layer, layer => layer.on(EDIT_EVENTS, this._geomChanged))
  }

  applyStyle () {
    if (this.parent.map) {
      this.parent.info.geomStyle.apply(this)
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

  edit (properties) {
    super.edit(properties)
    this.applyStyle()
  }

  geomChanged () {
    this.removeEditEvents()
    this.status.geomEdited = true
    this.status.edited = true

    const revertLayer = makeLayerReverter(this.layer)

    this._revertLayer = () => {
      revertLayer()
      this.addEditEvents()
    }

    this.applyStyle()
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
    } else {
      this.layer = null
    }
  }

  merge (other) {
    this.data = other.data
    if (!this.layer) {
      this.makeLayer()
    } else if (this.geometry) {
      const coords = flipLatLng(this.geometry.coordinates)
      if (this.layer.setLatLng) {
        this.layer.setLatLng(coords)
      } else if (this.layer.setLatLngs) {
        this.layer.setLatLngs(coords)
      } else {
        const layers = this.layer.getLayers()

        const a = layers.length
        const b = coords.length
        let i = 0
        for (; i < a && i < b; ++i) {
          if (layers[i].setLatLng) {
            layers[i].setLatLng(coords[i])
          } else if (layers[i].setLatLngs) {
            layers[i].setLatLngs(coords[i])
          }
        }
        if (a > b) {
          for (; i < a; ++i) {
            this.layer.removeLayer(layers[i])
            layers[i].remove()
          }
        } else if (a < b) {
          const feature = {
            type: this.geometry.type,
            coordinates: this.geometry.coordinates.slice(i)
          }
          const group = L.GeoJSON.geometryToLayer(feature, this.getGeomConfig())
          group.getLayers().forEach(layer => layer.addTo(this.layer))
        }
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
    if (this.status.geomEdited) {
      this.revertLayer()
    }
    super.revert()
  }

  revertLayer () {
    if (this._revertLayer) {
      this._revertLayer()
    }
  }

  setPk (obj, pk) {
    obj.id = pk
  }
}
