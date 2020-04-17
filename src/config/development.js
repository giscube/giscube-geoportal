import base from './lib.js'
// you can also do
// import base from './production.js'

// config for development

export default base.merge({
  // basemaps: [
  //   {
  //     default: true,
  //     type: 'tilelayer',
  //     name: 'Default base map',
  //     url: 'https://atilemaps.icgc.cat/mapfactory/wmts/topo_suau/CAT3857/{z}/{x}/{y}.png',
  //     attribution: '&copy; <a href="https://www.icgc.cat">ICGC</a>',
  //     maxNativeZoom: 18,
  //     maxZoom: 21
  //   },
  // // Google API key needed to use googleMutant layers
  //   {
  //     type: 'googleMutant',
  //     name: 'Roadmap Google',
  //     options: {
  //       type: 'roadmap'
  //     },
  //     maxNativeZoom: 18,
  //     maxZoom: 21
  //   }
  // ],
  // catalog: {
  //   categories: 'https://www.giscube.org/apps/giscube-admin/geoportal/category/',
  //   search: 'https://www.giscube.org/apps/giscube-admin/geoportal/catalog/'
  // },
  // editsources: [
  //   {
  //     name: 'Giscube',
  //     url: 'https://www.giscube.org/apps/giscube-admin/'
  //   }
  // ],
  // google: {
  //   apiKey: 'Your-Devel-Key'
  // }
  // searches: [
  //   {
  //     name: 'geoportal',
  //     title: 'Geoportal search',
  //     url: 'https://www.giscube.org/apps/giscube/geoportal/search/'
  //   },
  //   {
  //     name: 'place',
  //     title: 'General search',
  //     is_geojson: true,
  //     url: 'https://www.giscube.org/apps/indexer/search/'
  //   }
  // ]
})
