import isEqualWith from 'lodash/isEqualWith.js'

export function noop () {
  // No operation. Does nothing
}

export function isVoid (value) {
  return value === null || value === void 0
}

export function set (obj, key, value) {
  obj[key] = value
  return value
}

export function unique () {
  if (window.Symbol) {
    return Symbol('')
  } else {
    const r = {}
    Object.defineProperty(r, '_', {
      enumerable: true,
      configurable: false,
      writable: false,
      value: Date.now()
    })
    return Object.freeze(r)
  }
}

export function fromEntries (iterable) {
  // From https://github.com/feross/fromentries/blob/29b52a850bb3a47c390937631c2638edf3443942/index.js (under MIT)
  return [...iterable]
    .reduce((obj, { 0: key, 1: val }) => Object.assign(obj, { [key]: val }), {})
}

export function* reverse (arr) {
  for (let i = arr.length - 1; i >= 0; --i) {
    yield arr[i]
  }
}

export function* enumerate (ob) {
  let i = 0
  for (let value of ob) {
    yield [i, value]
    ++i
  }
}

export function createEnum (elements, ordered = false) {
  const values = ordered ? elements.map((_, i) => i) : elements.map(e => Symbol(e))

  const result = {}
  values.forEach(value => { result[value] = value })
  elements.forEach((e, i) => { result[e] = values[i] })
  return Object.freeze(result)
}

export function cloneClean (obj, allowEmptyString = true) {
  if (!allowEmptyString && obj === '') {
    return null
  } else if (obj === null || typeof obj !== 'object') {
    return obj
  }

  let result = obj.constructor()

  for (const key in obj) {
    if (!key.startsWith('__') && !key.startsWith('$')) {
      result[key] = cloneClean(obj[key], allowEmptyString)
    }
  }

  return result
}

function ignoreKey (key) {
  return typeof key === 'string' && (key.startsWith('__') || key.startsWith('$'))
}

export function isCleanEqual (a, b) {
  return isEqualWith(a, b, (aValue, bValue, key) => ignoreKey(key) ? true : undefined)
}

export function strContains (a, b) {
  if (a === null || a === void 0 || b === null || b === void 0) {
    return false
  }

  if (a === '') {
    return a === b
  }

  if (a === b) {
    return true
  } else {
    return a.toString().toLowerCase().includes(b.toString().toLowerCase())
  }
}

export function escapeRegex (unsafe) {
  return unsafe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function escapeHtml (unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export const INTERNAL_PROPERTY = Object.freeze({
  configurable: true,
  enumerable: false,
  writable: false
})
