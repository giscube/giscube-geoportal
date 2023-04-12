import L from 'leaflet'

L.TileLayer.Grayscale = L.TileLayer.extend({
  options: {
    imageSize: 256,
    quotaRed: 21,
    quotaGreen: 71,
    quotaBlue: 8,
    quotaDividerTune: 0,
    quotaDivider: function () {
      return this.quotaRed + this.quotaGreen + this.quotaBlue + this.quotaDividerTune
    }
  },

  initialize: function (url, options) {
    options.crossOrigin = true
    L.TileLayer.prototype.initialize.call(this, url, options)

    this.on('tileload', function (e) {
      this._makeGrayscale(e.tile, options)
    })
  },

  _createTile: function () {
    var tile = L.TileLayer.prototype._createTile.call(this)
    tile.crossOrigin = 'Anonymous'
    return tile
  },

  _makeGrayscale: function (img, options) {
    if (img.getAttribute('data-grayscaled')) {
      return
    }

    img.crossOrigin = ''
    var canvas = document.createElement('canvas')
    canvas.width = options.imageSize
    canvas.height = options.imageSize
    var ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height)
    var pix = imgd.data
    for (var i = 0, n = pix.length; i < n; i += 4) {
      pix[i] = pix[i + 1] = pix[i + 2] = (this.options.quotaRed * pix[i] + this.options.quotaGreen * pix[i + 1] + this.options.quotaBlue * pix[i + 2]) / this.options.quotaDivider()
    }
    ctx.putImageData(imgd, 0, 0)
    img.setAttribute('data-grayscaled', true)
    img.src = canvas.toDataURL()
  }
})

L.tileLayer.grayscale = function (url, options) {
  return new L.TileLayer.Grayscale(url, options)
}
