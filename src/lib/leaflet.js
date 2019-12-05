import L from 'leaflet'
import 'leaflet.locatecontrol'
import 'leaflet.markercluster'
import 'leaflet.path.drag'
import 'leaflet-editable'
import './leaflet-offset'

try {
  require('leaflet-boundary-canvas')
} catch {
  /* Optional dependecy not installed. Do nothing */
}

// CSS
require('../../node_modules/leaflet/dist/leaflet.css')
require('../../node_modules/leaflet.markercluster/dist/MarkerCluster.css')
require('../../node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css')

// FIX leaflet's default icon path problems with webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export { L, L as default }
