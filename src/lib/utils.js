import isEqualWith from 'lodash/isEqualWith.js'

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

export function escapeHtml (unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
