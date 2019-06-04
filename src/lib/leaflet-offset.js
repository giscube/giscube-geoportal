import L from 'leaflet'

const _ = {
  setView: L.Map.prototype.setView,
  flyTo: L.Map.prototype.flyTo
}

L.Map.include({
  _toReal (latlng, zoom) {
    zoom = zoom === void 0 ? this.getZoom() : zoom
    let p = this.project(latlng, zoom)
    p = p.subtract(this.getGlobalOffset())
    return this.unproject(p, zoom)
  },
  _toVisible (latlng, zoom) {
    zoom = zoom === void 0 ? this.getZoom() : zoom
    let p = this.project(latlng, zoom)
    p = p.add(this.getGlobalOffset())
    return this.unproject(p, zoom)
  },
  flyTo (latlng, zoom, options = {}) {
    if (options.animate !== false) {
      const result = this._toReal(latlng, zoom)
      return _.flyTo.call(this, result, zoom, options)
    } else {
      return _.setView.call(this, latlng, zoom, options)
    }
  },
  flyToBounds (bounds, options = {}) {
    const tl = L.point([this._padding.left, this._padding.top])
    const br = L.point([this._padding.right, this._padding.bottom])

    options.paddingTopLeft = L.point(options.paddingTopLeft || options.padding || [0, 0]).add(tl)
    options.paddingBottomRight = L.point(options.paddingBottomRight || options.padding || [0, 0]).add(br)
    delete options.padding

    const target = this._getBoundsCenterZoom(bounds, options)
    return _.flyTo.call(this, target.center, target.zoom, options)
  },
  setView (latlng, zoom, options = {}) {
    const result = this._toReal(latlng, zoom)
    return _.setView.call(this, result, zoom, options)
  },
  setZoom (zoom, options) {
    if (!this._loaded) {
      this._zoom = zoom
      return this
    }
    return this.setView(this.getVisibleCenter(), zoom, { zoom: options })
  },
  getVisibleCenter () {
    return this._toVisible(this.getCenter())
  },
  setZoomAround (latlng, zoom, options) {
    const scale = this.getZoomScale(zoom)
    const viewHalf = this.getSize().divideBy(2)
    const containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng)

    const centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale)
    const newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset))

    return _.setView.call(this, newCenter, zoom, { zoom: options })
  },

  getGlobalOffset () {
    return this._offset || L.point([0, 0])
  },
  setGlobalPadding (padding) {
    const pad = this._padding = {
      right: 0,
      left: 0,
      top: 0,
      bottom: 0,

      ...padding
    }
    this._offset = L.point([
      (pad.left - pad.right) / 2,
      (pad.top - pad.bottom) / 2
    ])
  }
})
