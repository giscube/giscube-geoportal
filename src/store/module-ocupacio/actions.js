import axios from 'axios'

import L from 'src/lib/leaflet'
import GiscubeRef from 'src/lib/refs/giscube'
import IconsGenerator from 'src/lib/table/geom-styles/icons/IconsGenerator'

function idFromString (word) {
  let number = 0
  for (let i = 0; i < word.length; i++) {
    number += word.charCodeAt(i)
  }
  return new GiscubeRef(number)
}

function parseWKT (wkt) {
  const coordString = wkt.replace(/^[A-Z]+\(/, '').replace(/\)$/, '')

  if (wkt.startsWith('POINT')) {
    const coords = coordString.split(' ').map(Number)
    return {
      type: 'Point',
      coordinates: [coords[1], coords[0]]
    }
  } else if (wkt.startsWith('LINESTRING')) {
    const coords = coordString.split(',').map(pair => {
      const [lng, lat] = pair.trim().split(' ').map(Number)
      return [lat, lng]
    })
    return {
      type: 'LineString',
      coordinates: coords
    }
  } else if (wkt.startsWith('POLYGON')) {
    const ringString = coordString.replace(/^\(/, '').replace(/\)$/, '')
    const coords = ringString.split(',').map(pair => {
      const [lng, lat] = pair.trim().split(' ').map(Number)
      return [lat, lng]
    })
    return {
      type: 'Polygon',
      coordinates: [coords]
    }
  }

  return null
}

function convertToGeoJSON (apiData) {
  const features = apiData.map(item => {
    const geometry = parseWKT(item.wkt)

    if (!geometry) {
      console.warn('No se pudo parsear WKT:', item.wkt)
      return null
    }

    return {
      type: 'Feature',
      geometry: geometry,
      properties: {
        nomgeom: item.nomgeom,
        nom: item.nom,
        ItemId: item.ItemId,
        Inici: item.Inici,
        Final: item.Final,
        originalWkt: item.wkt
      }
    }
  }).filter(feature => feature !== null)

  return {
    type: 'FeatureCollection',
    features: features
  }
}

function createLayer (apiData, type) {
  const geoJsonData = convertToGeoJSON(apiData)

  const layer = L.geoJSON(geoJsonData, {
    pointToLayer: function (feature, latlng) {
      let color = 'green'
      if (feature.properties['nomgeom'] === 'Polígon') {
        color = '#eb9c1c'
      } else if (feature.properties['nomgeom'] === 'Linia avall') {
        color = 'red'
      }

      return L.marker(latlng, {
        icon: IconsGenerator.icon({
          type: 'preset',
          fill: color,
          icon: 'las la-exclamation-triangle',
          color: 'white'
        })
      })
    },
    style: function (feature) {
      let color = 'blue'
      let weight = 3

      if (feature.properties['nomgeom'] === 'Polígon') {
        color = '#eb9c1c'
        weight = 2
      } else if (feature.properties['nomgeom'] === 'Linia avall') {
        color = 'red'
        weight = 4
      }

      return {
        color: color,
        weight: weight,
        opacity: 0.8,
        fillOpacity: 0.3
      }
    },
    onEachFeature: (feature, layer) => {
      let popupComponent

      const PopupContent = popupComponent
      const popup = new PopupContent({
        propsData: { feature, layer }
      })

      popup.$on('delete', () => {
        layer.remove()
      })

      layer.bindPopup(popup.$mount().$el)
    }
  })

  return layer
}

export function getResponse (context, { url, date1, date2 }) {
  url += '&apiKey=' + context.state.token + '&desde=' + date1 + '&fins=' + date2
  return axios.get(url)
}

export function addOcupacio (context, { url, date1, date2 }) {
  context.state.loading = true
  context.dispatch('getResponse', { url, date1, date2 })
    .then(response => {
      console.log('Ocupació response', response.data)
      const layer = createLayer(response, 'ocupacio')

      this.dispatch('map/addOverlay', {
        layer,
        layerType: 'geojson',
        name: 'Ocupacions',
        id: new GiscubeRef(idFromString('ocupació'))
      })
    })
    .catch(_ => {
      console.log('fail')
    })
    .then(_ => {
      context.state.loading = false
    })
}
