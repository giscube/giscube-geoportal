import base from './lib.js'
// you can also do
// import base from './production.js'

// config for development

export default base.merge({
  // catalog: {
  //   'categories': 'https://www.giscube.org/apps/giscube-admin/api/v1/giscube/category/',
  //   'search': 'https://www.giscube.org/apps/giscube-admin/geoportal/catalog/'
  // },
  // editsources: [
  //   {
  //     name: 'Giscube',
  //     url: 'https://www.giscube.org/apps/giscube-admin/'
  //   }
  // ],
  // searches: [
  //   {
  //     'name': 'geoportal',
  //     'title': 'Geoportal search',
  //     'url': 'https://www.giscube.org/apps/giscube/geoportal/search/'
  //   },
  //   {
  //     'name': 'place',
  //     'title': 'General search',
  //     'is_geojson': true,
  //     'url': 'https://www.giscube.org/apps/indexer/search/'
  //   }
  // ],
  // tools: {
  //   streetview: {
  //     apiKey: 'Your-Devel-Key'
  //   }
  // }
})
