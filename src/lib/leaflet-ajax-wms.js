import axios from 'axios'
import L from 'leaflet'

/*
 * Based on https://github.com/Leaflet/Leaflet/issues/2091#issuecomment-302706529
 */

L.TileLayer.AjaxWMS = L.TileLayer.WMS.extend({
  options: {
    headers: {}
  },
  createTile (coords, done) {
    const url = this.getTileUrl(coords)
    const img = document.createElement('img')
    const config = {
      headers: this.options.headers,
      responseType: 'blob'
    }
    axios.get(url, config)
      .then(response => {
        const imageUrl = URL.createObjectURL(response.data)
        img.addEventListener('load', () => URL.revokeObjectURL(imageUrl))
        img.src = imageUrl
        done(null, img)
      })
      .catch(e => done(e, img))
    return img
  }
})

L.tileLayer.ajaxWMS = (url, options) => new L.TileLayer.AjaxWMS(url, options)
