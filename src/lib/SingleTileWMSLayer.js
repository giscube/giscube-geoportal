import L from './leaflet.js'

if (typeof L === 'undefined') {
  throw new Error('Leaflet must be loaded first!')
}

const wms = {}

// Definición de wms.Source
wms.Source = L.Layer.extend({
  options: {
    untiled: true,
    identify: true
  },

  initialize (url, options) {
    L.setOptions(this, options)
    if (this.options.tiled) {
      this.options.untiled = false
    }
    this._url = url
    this._subLayers = {}
    this._overlay = this.createOverlay(this.options.untiled)
    this._zIndex = 0
  },

  createOverlay (untiled) {
    let overlayOptions = {}
    for (let opt in this.options) {
      if (opt !== 'untiled' && opt !== 'identify') {
        overlayOptions[opt] = this.options[opt]
      }
    }
    return untiled ? wms.overlay(this._url, overlayOptions) : wms.tileLayer(this._url, overlayOptions)
  },

  onAdd () {
    this.refreshOverlay()
  },

  getEvents () {
    return this.options.identify ? { 'click': this.identify } : {}
  },

  setOpacity (opacity) {
    this.options.opacity = opacity
    if (this._overlay) {
      this._overlay.setOpacity(opacity)
    }
  },

  setZIndex (zIndex) {
    this._zIndex = zIndex
    if (this._overlay && this._overlay.setZIndex) {
      this._overlay.setZIndex(zIndex)
    }
  },

  getLayer (name) {
    return wms.layer(this, name)
  },

  addSubLayer (name) {
    this._subLayers[name] = true
    this.refreshOverlay()
  },

  removeSubLayer (name) {
    delete this._subLayers[name]
    this.refreshOverlay()
  },

  refreshOverlay () {
    let subLayers = Object.keys(this._subLayers).join(',')
    if (!this._map) {
      return
    }
    if (!subLayers) {
      this._overlay.remove()
    } else {
      this._overlay.setParams({ 'layers': subLayers })
      this._overlay.addTo(this._map)
    }
  }
})

wms.source = (url, options) => new wms.Source(url, options)

// Definición de wms.Layer
wms.Layer = L.Layer.extend({
  initialize (source, layerName, options) {
    L.setOptions(this, options)
    if (!source.addSubLayer) {
      source = wms.getSourceForUrl(source, options)
    }
    this._source = source
    this._name = layerName
  },

  onAdd () {
    if (!this._source._map) {
      this._source.addTo(this._map)
    }
    this._source.addSubLayer(this._name)
  },

  onRemove () {
    this._source.removeSubLayer(this._name)
  },

  setOpacity (opacity) {
    this._source.setOpacity(opacity)
  },

  setZIndex (zIndex) {
    this._source.setZIndex(zIndex)
  }
})

wms.layer = (source, options) => new wms.Layer(source, options)

const sources = {}

wms.getSourceForUrl = (url, options) => {
  if (!sources[url]) {
    sources[url] = wms.source(url, options)
  }
  return sources[url]
}

wms.TileLayer = L.TileLayer.WMS
wms.tileLayer = L.tileLayer.wms

wms.Overlay = L.Layer.extend({
  defaultWmsParams: {
    service: 'WMS',
    request: 'GetMap',
    version: '1.1.1',
    layers: '',
    styles: '',
    format: 'image/jpeg',
    transparent: false
  },

  options: {
    crs: null,
    uppercase: false,
    attribution: '',
    opacity: 1,
    isBack: false,
    minZoom: 0,
    maxZoom: 18
  },

  initialize (url, options) {
    this._url = url
    let params = {}
    for (let opt in options) {
      if (!(opt in this.options)) {
        params[opt] = options[opt]
        delete options[opt]
      }
    }
    L.setOptions(this, options)
    this.wmsParams = L.extend({}, this.defaultWmsParams, params)
    this._zIndex = 0
  },

  setParams (params) {
    L.extend(this.wmsParams, params)
    this.update()
  },

  getAttribution () {
    return this.options.attribution
  },

  onAdd () {
    this.update()
  },

  onRemove (map) {
    if (this._currentOverlay) {
      map.removeLayer(this._currentOverlay)
      delete this._currentOverlay
    }
    if (this._currentUrl) {
      delete this._currentUrl
    }
  },

  getEvents () {
    return { 'moveend': this.update }
  },

  setZIndex (zIndex) {
    this._zIndex = zIndex
    if (this._currentOverlay && this._currentOverlay._image) {
      this._currentOverlay._image.style.zIndex = zIndex
    }
  },

  update () {
    if (!this._map) {
      return
    }
    this.updateWmsParams()
    let url = this.getImageUrl()
    if (this._currentUrl === url) {
      return
    }
    this._currentUrl = url

    let bounds = this._map.getBounds()
    let overlay = L.imageOverlay(url, bounds, { opacity: 0 })
    overlay.addTo(this._map)
    overlay.once('load', () => {
      if (!this._map) return
      if (overlay._url !== this._currentUrl) {
        this._map.removeLayer(overlay)
        return
      } else if (this._currentOverlay) {
        this._map.removeLayer(this._currentOverlay)
      }
      this._currentOverlay = overlay
      overlay.setOpacity(this.options.opacity || 1)
      this.setZIndex(this._zIndex)
    })
  },

  updateWmsParams (map = this._map) {
    let bounds = map.getBounds()
    let size = map.getSize()
    let wmsVersion = parseFloat(this.wmsParams.version)
    let crs = this.options.crs || map.options.crs
    let projectionKey = wmsVersion >= 1.3 ? 'crs' : 'srs'
    let nw = crs.project(bounds.getNorthWest())
    let se = crs.project(bounds.getSouthEast())

    let params = {
      width: size.x,
      height: size.y
    }
    params[projectionKey] = crs.code
    params.bbox = wmsVersion >= 1.3 && crs === L.CRS.EPSG4326
      ? [se.y, nw.x, nw.y, se.x].join(',')
      : [nw.x, se.y, se.x, nw.y].join(',')

    L.extend(this.wmsParams, params)
  },

  getImageUrl () {
    let pstr = L.Util.getParamString(this.wmsParams, this._url, this.options.uppercase || false)
    return this._url + pstr
  }
})

wms.overlay = (url, options) => new wms.Overlay(url, options)

export default wms
