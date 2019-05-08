import Options from '../lib/options.js'

// lib.js is used in library mode and also as a base when running the project
// if running the project modify either development.js or production.js

export default new Options({
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
  branding: {
    header: {
      logo: require('assets/logo_giscube.svg'),
      text: 'Giscube Geoportal'
    }
  },
  catalog: {
  },
  editsources: [
  ],
  geoportalMap: {
    queryOnClick: require('components/QueryOnClick.vue').default
  },
  home: {
    'zoom': 15,
    'center': {
      'lat': 41.973,
      'lng': 2.780
    }
  },
  layout: {
    /* components */
    header: require('components/AppHeader.vue').default,
    geoportalMap: require('components/GeoportalMap.vue').default,

    headerToolbar: [
      'home',
      'search',
      'catalog',
      'streetview',
      'data',
      'measure',
      'print',
      'help',
      'contact',
      '----------',
      'fullscreen',
      'auth'
    ],
    printHeaderToolbar: [
      'cancelPrint',
      'printPage',
      '-----------',
      'printDate'
    ]
  },
  locale: {
    main: 'en-us'
    // fallback: 'en-us' // optional
  },
  oauth: {
  },
  searches: [
  ],
  sentry: {
    dsn: null
  },
  tools: {
    auth: {
      icon: 'ion-person',
      to: 'auth',
      headerComponent: require('components/AuthHeaderItem.js').default
    },
    cancelPrint: {
      icon: 'cancel',
      action () {
        this.$store.dispatch('layout/setPrinting', false)
      }
    },
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
    help: {
      icon: 'help',
      to: 'help'
    },
    home: {
      icon: 'home',
      to: 'home',
      emit: 'home'
    },
    measure: {
      icon: 'mdi-ruler',
      to: 'measure'
    },
    print: {
      icon: 'print',
      action () {
        this.$store.dispatch('layout/setPrinting', true)
      }
    },
    printDate: {
      headerComponent: require('components/PrintDate.vue').default,
      print: true
    },
    printPage: {
      icon: 'print',
      action () {
        this.$nextTick(() => {
          window.print()
          this.$store.dispatch('layout/setPrinting', false)
        })
      }
    },
    search: {
      icon: 'search',
      to: 'search'
    },
    streetview: {
      icon: 'fas fa-street-view',
      to: 'streetview',
      apiKey: ''
    }
  }
})
