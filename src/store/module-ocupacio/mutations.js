import axios from 'axios'
import L from 'src/lib/leaflet'

export function addOcupacio (context, { url, date1, date2 }) {
    context.state.loading = true
    context.dispatch('getResponse', { url, date1, date2 })
    .then(response => {
      this.dispatch('map/addOverlay', {
        layer: tallsToLayer(response.data.talls),
        layerType: 'geojson',
        name: 'Ocuació',
        id: new lib.refs.GiscubeRef(idFromString('ocupació'))
      })
    })
    .catch(_ => {
      context.dispatch('addOcupacio', { url, date1 })
    })
    .then(_ => {
      context.state.loading = false
    })
}