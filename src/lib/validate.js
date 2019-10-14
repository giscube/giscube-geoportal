class ValidationError {
  constructor (obj, key, req) {
    this.keys = [key]
    this.value = obj[key]
    this.req = req
    console.log(req)
  }

  addKey (key) {
    this.keys.unshift(key)
  }

  toError () {
    const path = this.keys.join('.')
    return new Error(`Error validating ${path}: ${JSON.stringify(this.value)} does not conform "${this.req}"`)
  }
}

function _conforms (obj, key, value) {
  if (typeof value === 'function' || value instanceof Function) {
    return obj[key] instanceof value
  } else if (typeof value === 'string' || value instanceof String) {
    return typeof obj[key] === value // eslint-disable-line valid-typeof
  } else if (typeof value === 'object') {
    _validate(obj[key], value)
    return true
  } else {
    return obj.hasOwnProperty(key)
  }
}

function conforms (obj, key, value) {
  let test = false

  try {
    test = _conforms(obj, key, value)
  } catch (e) {
    if (e instanceof ValidationError) {
      e.addKey(key)
    }
    throw e
  }

  if (!test) {
    throw new ValidationError(obj, key, value)
  }
}

function _validate (obj, template) {
  Object.entries(template)
    .forEach(([key, value]) => conforms(obj, key, value))
}

export default function validate (obj, template) {
  try {
    _validate(obj, template)
  } catch (e) {
    if (e instanceof ValidationError) {
      throw e.toError()
    } else {
      throw e
    }
  }
}
