import Vue from 'vue'
import L from 'src/lib/leaflet'
import { fromEntries, regexEscape } from 'src/lib/utils'
import { strCrc16ibm } from 'src/lib/algs/crc16ibm'
import { fromUInt16, toUInt16 } from 'src/lib/algs/base64'
import { CoordinatesRef, GiscubeRef } from 'src/lib/refs'

import { ParseError, UnsupportedTypeError } from './errors'

const truthy = v => !!v
const separateFirst = separator => v => v.split(new RegExp(regexEscape(separator) + '(.*)')).filter(truthy)

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

    if (!str) {
      return void 0
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
    return indexValid ? index : void 0
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
      return fromEntries(keys.map(key => [key, true]))
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
types.geom = types.geometry = types.search = {
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
    } else if (type === 'c') {
      let coordsList = str.substring(1).split('~')[0].split(',')
      if (coordsList.length === 3) {
        return L.circle(coords[0], { radius: coordsList[2] })
      } else {
        return L.circle(coords[0], { radius: 20 })
      }
    } else if (type === 'k') {
      let coordsList = str.substring(1).split('~')[0].split(',')
      if (coordsList.length === 3) {
        return L.circleMarker(coords[0], { radius: coordsList[2] })
      } else {
        return L.circleMarker(coords[0], { radius: 20 })
      }
    } else {
      // TODO exception?
    }
  },
  toQuery (obj) {
    if (obj instanceof L.Polygon) {
      const latlngs = obj.getLatLngs()[0].map(c => [c.lat, c.lng])
      return 'p' + geomCoordsList.toQuery(latlngs)
    } else if (obj instanceof L.Polyline) {
      let latlngs = obj.getLatLngs()
      if (Array.isArray(latlngs[0])) {
        latlngs = latlngs.flat().map(c => [c.lat, c.lng])
      } else {
        latlngs = latlngs.map(c => [c.lat, c.lng])
      }
      return 'l' + geomCoordsList.toQuery(latlngs)
    } else if (obj instanceof L.Circle) {
      const radius = obj.getRadius()
      return 'c' + geomCoordsList.toQuery([obj.getLatLng()]) + ',' + radius
    } else if (obj instanceof L.CircleMarker) {
      const radius = obj.getRadius()
      return 'k' + geomCoordsList.toQuery([obj.getLatLng()]) + ',' + radius
    } else if (obj.getLatLng) {
      return 'm' + geomCoordsList.toQuery([obj.getLatLng()])
    } else {
      throw new UnsupportedTypeError('geometry', obj)
    }
  }
}

types.list = list

const msgGeomSplit = separateFirst('~')
types.msgGeom = types.msggeom = {
  fromQuery (str) {
    const [geom, message] = msgGeomSplit(str)
    const result = types.geom.fromQuery(geom)
    result.sharedMessage = message && types.string.fromQuery(message)
    return result
  },
  toQuery (layer) {
    const result = [types.geom.toQuery(layer)]
    if (layer.sharedMessage) {
      result.push(types.string.toQuery(layer.sharedMessage))
    }
    return result.join('~')
  }
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
  toQuery (obj, { precision = 6 } = {}) {
    if (typeof obj === 'number') {
      if (Number.isInteger(obj)) {
        return obj.toString()
      } else {
        return obj.toFixed(precision)
      }
    } else {
      throw new UnsupportedTypeError('number', obj)
    }
  }
}

types.result = {
  fromQuery (str) {
    if (!str || str.length < 1) {
      return // TODO exception?
    }

    const type = str.charAt(0)
    let [ref, opacity = '1'] = str.slice(1).split(':')
    opacity = types.number.fromQuery(opacity)

    if (type === 'c') {
      const coords = types.coords.fromQuery(ref)
      const marker = L.marker(coords)
      return {
        ref: new CoordinatesRef(marker),
        opacity
      }
    } else if (type === 'g') {
      ref = types.string.fromQuery(ref)
      return {
        ref: new GiscubeRef(ref),
        opacity
      }
    } else {
      // TODO exception?
    }
  },
  toQuery ({ ref, opacity = 1 }) {
    opacity = Math.max(Math.min(opacity, 1), 0) // clamp value between 0 and 1 (inclusive)
    let o = opacity < 1 ? ':' + types.number.toQuery(opacity, { precision: 2 }) : '' // most common case uses less space

    if (ref instanceof CoordinatesRef) {
      return 'c' + types.coords.toQuery(ref.latlng) + o
    } else if (ref instanceof GiscubeRef) {
      return 'g' + types.string.toQuery(ref.toPlainRef()) + o
    } else {
      throw new UnsupportedTypeError('result', ref)
    }
  }
}

types.string = {
  fromQuery: decodeURIComponent,
  toQuery: v => v ? encodeURIComponent(v) : void 0
}

// Export types
export { types as default, types }
