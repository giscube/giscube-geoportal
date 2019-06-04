function isValid (v) {
  return v !== null && v !== void 0
}

export default class DottedPath {
  constructor (path) {
    if (!path) {
      this._parts = []
    } else {
      this._parts = path.split('.').filter(v => v.length > 0).map(v => {
        const n = parseInt(v)
        return isNaN(n) ? v : n
      })
    }
  }

  get parts () {
    return this._parts
  }

  extractFrom (obj) {
    const parts = this._parts
    let r = obj
    let i = 0
    for (; i < parts.length && isValid(r); ++i) {
      r = r[parts[i]]
    }
    return i < parts.length ? void 0 : r
  }

  setTo (obj, value) {
    const parts = this._parts
    const last = parts.length - 1
    if (last < 0) {
      if (typeof obj === 'object' && typeof value === 'object') {
        Object.assign(obj, value)
      }
      return value
    }

    let r = obj
    let i = 0
    for (; i < last; ++i) {
      if (obj !== void 0 && typeof obj !== 'object') {
        throw new Error('Cannot override an intermediate value')
      }
      const p = parts[i]
      if (r[p] === null || r[p] === void 0) {
        r[p] = {}
      }
      r = r[p]
    }

    r[parts[last]] = value
    return value
  }
}
