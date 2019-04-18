import Options from './options.js'

export default new Options({
  branding: {
    header: {
      logo: require('assets/logo_giscube.svg'),
      text: 'Giscube Geoportal'
    }
  },
  geoportalMap: {
    queryOnClick: require('components/QueryOnClick.vue').default
  },
  layout: {
    /* components: { */
    header: require('components/AppHeader.vue').default,
    geoportalMap: require('components/GeoportalMap.vue').default,
    printHeader: require('components/PrintHeader.vue').default,

    headerToolbar: [
      'home',
      'search',
      'catalog',
      'streetview',
      'data',
      'measure',
      'print',
      'contact',
      '----------',
      'fullscreen',
      'auth'
    ]
  },
  tools: {
    catalog: {
      icon: 'ion-compass',
      to: 'catalog'
    },
    contact: {
      icon: 'email',
      to: 'contact'
    },
    data: {
      icon: 'edit',
      to: 'data'
    },
    fullscreen: {
      supported () {
        return this.$q.fullscreen.isCapable
      },
      icon () {
        return this.$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'
      },
      action () {
        this.$q.fullscreen.toggle()
      }
    },
    home: {
      icon: 'home',
      to: 'home',
      emit: 'home'
    },
    auth: {
      icon: 'ion-person',
      to: 'auth'
    },
    measure: {
      icon: 'mdi-ruler',
      to: 'measure'
    },
    print: {
      icon: 'print',
      emit: 'print'
    },
    search: {
      icon: 'search',
      to: 'search'
    },
    streetview: {
      icon: 'fas fa-street-view',
      to: 'streetview',
      apiKey: 'AIzaSyA-T7DgvIL7-hohqVZosujoiLPfgQWFAPw'
    }
  },
  catalog: {
    'categories': 'https://www.giscube.org/apps/giscube-admin/api/v1/giscube/category/',
    'search': 'https://www.giscube.org/apps/giscube-admin/geoportal/catalog/'
  },
  home: {
    'zoom': 15,
    'center': {
      'lat': 41.973,
      'lng': 2.780
    }
  },
  oauth: {
  },
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
  basemaps: [
    {
      default: true,
      type: 'tilelayer',
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    },
    {
      default: false,
      type: 'tilelayer',
      name: 'OpenTopoMap',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      maxZoom: 19
    },
    {
      default: false,
      type: 'tilelayer',
      name: 'Stamen TonerLite',
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    }
  ],
  editsources: [
    {
      name: 'Giscube',
      url: 'https://www.giscube.org/apps/giscube-admin/'
    }
  ]
})
