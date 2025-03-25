import Vue from 'vue'
import LatLngPopup from 'components/LatLngPopup'

export default class CoordinatesRef {
  constructor (marker) {
    this.layer = marker
    this.latlng = marker.getLatLng()
    this.plainRef = `${this.latlng.lat}, ${this.latlng.lng}`
  }

  toPlainRef () {
    return this.plainRef
  }

  equals (other) {
    return this.latlng.equals(other.latlng)
  }

  canOpen () {
    return true
  }

  async openInSidebar ({ $router }) {
    $router.push({
      name: 'coords',
      params: {
        epsg: '4326',
        coords: this.plainRef
      }
    })
  }

  async addAsResult (opacity, $root) {
    const PopupContent = Vue.extend(LatLngPopup)
    const popup = new PopupContent({
      parent: $root,
      propsData: {
        latlng: this.layer.getLatLng()
      }
    })
    this.layer.bindPopup(popup.$mount().$el)

    return () => {
      $root.$store.dispatch('map/addOverlay', {
        id: this,
        layer: this.layer,
        name: `${this.latlng.lat}, ${this.latlng.lng}`,
        opacity
      })
    }
  }

  async getAsResult (opacity, $root) {
    this.addAsResult(opacity, $root)
  }
}
