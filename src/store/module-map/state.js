import L from 'src/lib/leaflet'

export default {
  mapObject: null,
  state: {
    center: void 0,
    zoom: void 0
  },
  layers: {
    baseLayer: void 0,
    overlays: [],
    _overlaysGroup: L.layerGroup()
  },
  shared: L.layerGroup(),
  drawing: false // changed by map events set in GeoportalMap
}
