import L from 'src/lib/leaflet'

import { ParseError, UnsupportedTypeError } from './errors'

const truthy = v => !!v

const types = {}

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

{
  class FlagGroup {
    contructor (allowed) {
      this.allowed = allowed
    }

    fromQuery (str) {
      const keys = str.split(/\W+/g).filter(this.allowed ? this.allowed.includes : truthy)
      return Object.fromEntries(keys.map(key => [key, true]))
    }

    toQuery (obj) {
      const result = Object.entries(obj)
        .filter(([key, value]) => !!value)
        .map(([key, _]) => key)
        .filter(this.allowed ? this.allowed.includes : truthy)
        .join(',')

      if (result) {
        return result
      }
    }
  }
  // default group without restrictions
  const defaultGroup = new FlagGroup()
  // set the actual type
  types.flags = function (allowed) {
    return new FlagGroup(allowed)
  }
  types.flags.fromQuery = defaultGroup.fromQuery.bind(defaultGroup)
  types.flags.toQuery = defaultGroup.toQuery.bind(defaultGroup)
}

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

types.string = {
  fromQuery: decodeURIComponent,
  toQuery: encodeURIComponent
}

// Export types
export { types as default, types }
