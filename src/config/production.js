import base from './lib.js'

// config for giscube.org

export default base.merge({
  catalog: {
    'categories': 'https://www.giscube.org/apps/giscube-admin/geoportal/category/',
    'search': 'https://www.giscube.org/apps/giscube-admin/geoportal/catalog/'
  },
  editsources: [
    {
      name: 'Giscube',
      url: 'https://www.giscube.org/apps/giscube-admin/'
    }
  ],
  searches: [
    {
      'name': 'geoportal',
      'title': 'Geoportal search',
      'url': 'https://www.giscube.org/apps/giscube/geoportal/search/'
    },
    {
      'name': 'place',
      'title': 'General search',
      'is_geojson': true,
      'url': 'https://www.giscube.org/apps/indexer/search/'
    }
  ],
  tools: {
    streetview: {
      apiKey: 'AIzaSyDp_TZ0MTqUi18tC2qk_ifhXziqoJj-ntU' // giscube.org only ;)
    }
  }
})
