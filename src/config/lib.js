import Options from '../lib/options.js'
import Search from '../lib/search'

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
      text: 'Giscube Geoportal',
      link: null
    }
  },
  catalog: {
  },
  components: {
    resultTabs: {
      infoTab: {
        previewContentTypes: [
          'application/pdf',
          'image/jpeg'
        ]
      }
    }
  },
  defaultLayers: [],
  editsources: [
  ],
  epsgs: [
    {
      label: 'GPS',
      code: 'EPSG:4326',
      def: '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
      format: ([x, y]) => `${y.toFixed(6)}, ${x.toFixed(6)}`
    }
  ],
  except: {
    silent: false
  },
  geoportalMap: {
    queryOnClick: require('components/QueryOnClick.vue').default
  },
  home: {
    zoom: 15,
    center: {
      lat: 41.973,
      lng: 2.780
    }
  },
  layersControl: {
    itemPanel: true
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
      'draw',
      'print',
      'help',
      'contact',
      'share',
      '----------',
      'fullscreen',
      'auth'
    ],
    mapPointZoom: 19,
    mapZoomPadding: 0.05,
    mapMaxFlyZoom: 19,
    printHeaderToolbar: [
      'cancelPrint',
      'printPage',
      '-----------',
      'printDate'
    ],

    placePanel: {
      defaultComponent: () => require('components/PlacePanel.vue').default,
      strategyField: 'content_type',
      strategyOptions: {
        // 'example_value': () => require('components/PlacePanelBasedComponent.vue').default
      }
    },

    sidebar: {
      initialWidthPercentage: 30,
      minWidthPixels: 300,
      minWidthPercentage: 24,
      steps: [24, 45, 60, 75]
    }
  },
  locale: {
    main: 'en-us'
    // fallback: 'en-us' // optional
  },
  oauth: {
  },
  searchEngine: Search,
  searches: [
  ],
  sentry: {
    dsn: null
  },
  streetview: {
    followQueryMarker: true
  },
  tools: {
    auth: {
      icon: 'las la-user',
      to: 'auth',
      headerComponent: require('components/header/AuthHeaderItem.js').default
    },
    cancelPrint: {
      icon: 'cancel',
      action () {
        this.$store.dispatch('layout/setPrinting', false)
      }
    },
    catalog: {
      icon: 'las la-compass',
      to: 'catalog'
    },
    contact: {
      icon: 'las la-envelope',
      to: 'contact'
    },
    data: {
      icon: 'las la-pencil-alt',
      to: 'data'
    },
    draw: {
      icon: 'las la-ruler-horizontal',
      to: 'draw'
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
    google: {
      apiKey: ''
    },
    help: {
      icon: 'las la-question-circle',
      to: 'help'
    },
    home: {
      icon: 'las la-home',
      to: 'home',
      emit: 'home'
    },
    print: {
      icon: 'las la-print',
      action () {
        this.$store.dispatch('layout/setPrinting', true)
      }
    },
    printDate: {
      headerComponent: require('components/PrintDate.vue').default,
      print: true
    },
    printPage: {
      icon: 'las la-print',
      action () {
        this.$nextTick(() => {
          window.print()
          this.$store.dispatch('layout/setPrinting', false)
        })
      }
    },
    search: {
      icon: 'las la-search',
      to: 'search',
      searchResultPopup: require('components/SearchResultPopup.vue').default,

      historyLength: 5
    },
    share: {
      icon: 'share',
      to: 'share'
    },
    statistics: {
      enabled: false,

      groups: []
    },
    streetview: {
      icon: 'las la-street-view',
      to: 'streetview'
    }
  }
})
