import types from './types'
import behaviors from './behaviors'

const params = {}

params.center = params.c = {
  key: 'c',
  type: types.coordinates,
  multi: behaviors.overrides
}

params.message = params.m = {
  key: 'm',
  type: types.string,
  multi: behaviors.overrides
}

params.options = params.o = {
  key: 'o',
  type: types.flags(['mc', 'om']),
  multi: behaviors.merges
}
params.zoom = params.z = {
  key: 'z',
  type: types.number,
  multi: behaviors.overrides
}

// export values
export { params as default, params }
