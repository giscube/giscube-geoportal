'use strict'

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
