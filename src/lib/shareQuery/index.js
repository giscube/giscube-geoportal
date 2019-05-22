import { UnknownParameter } from './spec/errors'
import spec from './spec'

function _getParam (key) {
  const param = spec.params[key]
  if (!param) {
    throw new UnknownParameter(key)
  }
  return param
}

export function extract (obj, key) {
  const k = spec.params[key]
  if (k) {
    const r = obj[k.key]
    delete obj[k.key]
    return r
  }
}

export function apply (obj, key, callback) {
  const val = extract(obj, key)
  if (val !== void 0) {
    callback(val)
  }
  return val
}

function addArgument (obj, key, value) {
  const param = _getParam(key)
  obj[param.key] = param.multi(obj[param.key], value)
}

export function fromQuery (query) {
  const q = {}
  query
    .split('&')
    .filter(v => !!v)
    .forEach(v => {
      const [key, value] = v.split(/=(.+)/)
      const param = _getParam(key)
      addArgument(q, key, param.type.fromQuery(value))
    })
  return q
}

export function toQuery (obj) {
  if (!obj) {
    return ''
  }
  const q = Object.entries(obj)
    .map(([key, value]) => {
      const param = _getParam(key)
      if (value !== void 0) {
        const arg = param.type.toQuery(value)
        if (arg !== void 0) {
          return param.key + '=' + arg
        }
      }
    })
    .filter(v => !!v)
    .join('&')
  return q ? '?' + q : ''
}
