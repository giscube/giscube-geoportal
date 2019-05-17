import isEqualWith from 'lodash/isEqualWith.js'

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
