import L from 'leaflet'
import 'leaflet.locatecontrol'
import 'leaflet.path.drag'
import 'leaflet-editable'
require('../../node_modules/leaflet/dist/leaflet.css')

// FIX leaflet's default icon path problems with webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export { L, L as default }
