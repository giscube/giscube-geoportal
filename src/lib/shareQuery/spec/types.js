import Vue from 'vue'
import L from 'src/lib/leaflet'
import { strCrc16ibm } from 'src/lib/algs/crc16ibm'
import { fromUInt16, toUInt16 } from 'src/lib/algs/base64'

import { ParseError, UnsupportedTypeError } from './errors'

const truthy = v => !!v

const types = {}

function list (type, separator) {
  return {
    fromQuery (str) {
      return str.split(separator).map(type.fromQuery)
    },
    toQuery (obj) {
      return (obj && obj.length > 0) ? obj.map(type.toQuery).filter(v => v !== void 0).join(separator) : void 0
    }
  }
}

types.basemap = {
  fromQuery (str) {
    const config = Vue.prototype.$config
    const basemaps = config.basemaps

    const defaultMap = () => config.basemaps.findIndex(bm => bm.default) || 0

    if (!str) {
      return defaultMap()
    }

    const crc = toUInt16(str.slice(0, 3))
    const index = parseInt(str.slice(3), 16)
    const indexValid = !Number.isNaN(index) && index < basemaps.length

    // Check if the index has the correct checksum
    if (indexValid) {
      if (strCrc16ibm(basemaps[index].url) === crc) {
        return index
      }
    }

    // Search for a basemap with the given checksum
    for (let i = 0; i < basemaps.length; ++i) {
      if (i !== index) { // already tested on the previous step
        if (strCrc16ibm(basemaps[i].url) === crc) {
          return i
        }
      }
    }

    // Return the index (if possible)
    return indexValid ? index : defaultMap()
  },
  toQuery (index) {
    if (typeof index !== 'number' || index < 0) {
      return
    }

    const config = Vue.prototype.$config
    const obj = config.basemaps[index]
    return fromUInt16(strCrc16ibm(obj.url)) + index.toString(16)
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
    } else if (obj.hasOwnProperty('lat') && obj.hasOwnProperty('lng')) {
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

const geomCoordsList = list(types.coords, ';')
types.geom = types.geometry = {
  fromQuery (str) {
    if (!str) {
      return // TODO exception?
    }

    const type = str[0]
    const coords = geomCoordsList.fromQuery(str.substring(1))
    if (coords.length === 0) {
      return // TODO exception?
    }

    if (type === 'm') {
      return L.marker(coords[0])
    } else if (type === 'l') {
      return L.polyline(coords)
    } else if (type === 'p') {
      return L.polygon(coords)
    } else {
      // TODO exception?
    }
  },
  toQuery (obj) {
    if (obj instanceof L.Polygon) {
      const latlngs = obj.getLatLngs()[0].map(c => [c.lat, c.lng])
      return 'p' + geomCoordsList.toQuery(latlngs)
    } else if (obj instanceof L.Polyline) {
      const latlngs = obj.getLatLngs().map(c => [c.lat, c.lng])
      return 'l' + geomCoordsList.toQuery(latlngs)
    } else if (obj.getLatLng) {
      return 'm' + geomCoordsList.toQuery([obj.getLatLng()])
    } else {
      throw new UnsupportedTypeError('geometry', obj)
    }
  }
}

types.list = list
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
  toQuery: v => v ? encodeURIComponent(v) : void 0
}

// Export types
export { types as default, types }
