export const LAYER_TEMPLATE = Object.freeze({
  layerDescriptor: {
    group: 'boolean',
    projection: 'string',
    title: 'string',
    type: 'string',
    url: 'string'
  },
  title: 'string',
  options: 'object',
  auth: 'boolean'
})

export const LAYER_TEMPLATE_DEFAULTS = Object.freeze({
  layerDescriptor: {
    group: false,
    type: 'GeoJSON',
    projection: '4326'
  },
  options: {},
  auth: false
})
