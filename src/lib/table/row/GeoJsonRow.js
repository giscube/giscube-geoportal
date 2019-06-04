import L from 'src/lib/leaflet'
import { createLayer, flipLatLng } from 'src/lib/geomUtils'

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
    this.layer.on(EDIT_EVENTS, this._geomChanged)
  }

  applyGeomStyle () {
    this.parent.info.geomStyle.apply(this)
  }

  async asNew ({ map }) {
    const config = {
      bubblingMouseEvents: false
    }
    if (this.info.geomType === 'point' && this.info.shapeType === 'circle') {
      config.markerClass = L.CircleMarker
    }
    const layer = await createLayer({ map, type: this.info.geomType, config })
    const cloned = super.clone()
    cloned.layer = layer
    cloned.prepareLayer()
    return cloned
  }

  geomChanged () {
    this.layer.off(EDIT_EVENTS, this._geomChanged)
    this.status.geomEdited = true
    this.status.edited = true

    let f
    if (this.layer.getLatLngs) {
      const geom = this.layer.getLatLngs()
      f = this.layer.setLatLngs.bind(this.layer, geom)
    } else if (this.layer.getLatLng) {
      const geom = this.layer.getLatLng()
      f = this.layer.setLatLng.bind(this.layer, geom)
    }

    this._revertLayer = () => {
      f()
      this.addEditEvents()
    }
  }

  makeLayer () {
    const config = {
      style: {
        bubblingMouseEvents: false
      }
    }
    if (this.parent.info.shapeType === 'circle') {
      config.pointToLayer = (_, latlng) => L.circleMarker(latlng)
    }

    if (this.geometry) {
      this.layer = L.GeoJSON.geometryToLayer(this.geometry, config)
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
            layers[i].setLatLng(coords)
          } else if (layers[i].setLatLngs) {
            layers[i].setLatLngs(coords)
          }
        }
        if (a > b) {
          for (; i < a; ++i) {
            this.layer.removeLayer(layers[i])
          }
        } else {
          this.layer.addData({
            type: this.geometry.type,
            coordinates: this.geometry.coordinates.slice(i)
          })
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
    this.applyGeomStyle()
    this.layer.on('click', this.openPopup.bind(this))
    this.addEditEvents()
  }

  remove () {
    if (this.layer) {
      this.layer.remove()
      delete this.layer
    }
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
