// Configuration for your app
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = function (ctx) {
  return {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    boot: [
      'config',
      'i18n',
      'axios'
    ],

    css: [
      'app.styl'
    ],

    extras: [
      'roboto-font',
      'material-icons', // optional, you are not bound to it
      'ionicons-v4',
      'fontawesome-v5',
      'mdi-v3'
      // 'eva-icons'
    ],

    // framework: 'all', // --- includes everything; for dev only!
    framework: process.env.LIB ? 'all' : {
      components: [
        'QBtn',
        'QBtnDropdown',
        'QBtnGroup',
        'QBtnToggle',
        'QCard',
        'QCardActions',
        'QCardSection',
        'QChip',
        'QCheckbox',
        'QDialog',
        'QDrawer',
        'QExpansionItem',
        'QField',
        'QFooter',
        'QForm',
        'QIcon',
        'QImg',
        'QInput',
        'QItem',
        'QItemLabel',
        'QItemSection',
        'QLayout',
        'QList',
        'QMarkupTable',
        'QMenu',
        'QPageContainer',
        'QPage',
        'QResizeObserver',
        'QSelect',
        'QSeparator',
        'QSlider',
        'QSpace',
        'QSpinner',
        'QTab',
        'QTable',
        'QTabs',
        'QTd',
        'QTh',
        'QToolbar',
        'QToolbarTitle',
        'QTr'
      ],

      directives: [
        'ClosePopup',
        'Ripple'
      ],

      // Quasar plugins
      plugins: [
        'AppFullscreen',
        'Dialog',
        'Notify'
      ]

      // iconSet: 'ionicons-v4'
      // lang: 'de' // Quasar language
    },

    supportIE: true,

    build: {
      scopeHoisting: true,
      // vueRouterMode: 'history',
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      // using this while source maps are correctly picked up in apps using this lib:
      devtool: 'eval',
      extendWebpack (cfg) {
        if (process.env.LIB && cfg.mode === 'production') {
          console.log('process.env.LIB', process.env.LIB)
          console.log('CFG.entry', cfg.entry)
          // console.log('CFG.output', cfg.output)
          // console.log('CFG.optimization', cfg.optimization)
          console.log('CFG.plugins', cfg.plugins)

          cfg.entry = {
            'giscube-geoportal': './src/lib.js'
          }
          cfg.output = {
            path: cfg.output.path.slice(0, -3) + 'lib',
            filename: 'giscube-geoportal.min.js',
            library: 'giscube-geoportal',
            libraryTarget: 'umd'
          }
          cfg.optimization.splitChunks = undefined
          cfg.optimization.runtimeChunk = false  // set to 'single' if multiple chunks
          console.log('CFG.externals', cfg.externals)

          cfg.plugins.push(new MiniCssExtractPlugin({
            options:
              { filename: 'giscube-geoportal.min.css' }
          }))

          // cfg.plugins.push(new BundleAnalyzerPlugin())

          // cfg.plugins.push(new ExtractTextPlugin({
          //   filename: 'giscube-geoportal.min.css'
          // })

          cfg.externals = [
            'leaflet',
            'quasar',
            'vue',
            'vuex',
            'vue2-leaflet',
          ]
        }

        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/
        })
      }
    },

    devServer: {
      // https: true,
      // port: 8080,
      open: true // opens browser window automatically
    },

    // animations: 'all' --- includes all animations
    animations: [],

    ssr: {
      pwa: false
    },

    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {},
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            'src': 'statics/icons/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ]
      }
    },

    cordova: {
      // id: 'org.cordova.quasar.app'
    },

    electron: {
      // bundler: 'builder', // or 'packager'
      extendWebpack (cfg) {
        // do something with Electron process Webpack cfg
      },
      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      },
      builder: {
        // https://www.electron.build/configuration/configuration

        // appId: 'quasar-app'
      }
    }
  }
}
