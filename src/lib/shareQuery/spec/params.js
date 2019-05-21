import types from './types'
import behaviors from './behaviors'

const params = {}

params.center = params.c = {
  key: 'c',
  type: types.coordinates,
  multi: behaviors.overrides
}

params.zoom = params.z = {
  key: 'z',
  type: types.number,
  multi: behaviors.overrides
}

// export values
export { params as default, params }
