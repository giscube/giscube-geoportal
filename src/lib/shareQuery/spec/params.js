import types from './types'
import behaviors from './behaviors'

const params = {}

params.basemap = params.base = params.b = {
  key: 'b',
  type: types.basemap,
  multi: behaviors.overrides
}

params.center = params.c = {
  key: 'c',
  type: types.coordinates,
  multi: behaviors.overrides
}

params.geometry = params.geom = params.g = {
  key: 'g',
  type: types.list(types.msgGeom, ':'),
  multi: behaviors.overrides
}

params.layers = params.l = params.results = {
  key: 'l',
  type: types.list(types.result, ';'),
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

params.layout = params.la = {
  key: 'la',
  type: types.string,
  multi: behaviors.overrides
}

params.zoom = params.z = {
  key: 'z',
  type: types.number,
  multi: behaviors.overrides
}

// export values
export { params as default, params }
