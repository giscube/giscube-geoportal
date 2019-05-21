import L from 'src/lib/leaflet'

import { ParseError, UnsupportedTypeError } from './errors'

const types = {}

types.number = {
  fromQuery (str) {
    let r
    if (str.includes('.')) {
      r = Number.parseFloat(str)
    } else {
      r = Number.parseInt(str)
    }
    if (r === void 0 || Number.isNaN(r)) {
      throw new ParseError('number', str)
    }
    return r
  },
  toQuery (obj) {
    if (typeof obj === 'number') {
      if (Number.isInteger(obj)) {
        return obj.toString()
      } else {
        return obj.toFixed(6)
      }
    } else {
      throw new UnsupportedTypeError('number', obj)
    }
  }
}

types.coords = types.coordinates = {
  fromQuery (str) {
    const coords = str.split(',').map(types.number.fromQuery)
    coords.length = 2
    return L.latLng(coords)
  },
  toQuery (obj) {
    if (Array.isArray(obj)) {
      const r = obj.map(types.number.toQuery)
      r.length = 2
      return r.join(',')
    } else if (obj instanceof L.LatLng) {
      const lat = types.number.toQuery(obj.lat)
      const lng = types.number.toQuery(obj.lng)
      return lat + ',' + lng
    } else {
      throw new UnsupportedTypeError('coords', obj)
    }
  }
}

// Export types
export { types as default, types }
