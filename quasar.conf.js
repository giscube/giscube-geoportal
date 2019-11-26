// Configuration for your app
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = function (ctx) {
  return {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    boot: [
      'index',
      'i18n'
    ],

    css: [],

    // icon fonts
    extras: [
      'roboto-font',
      'material-icons',
      'ionicons-v4',
      'fontawesome-v5',
      'mdi-v3'
      // 'eva-icons'
    ],

    // framework: 'all', // --- includes everything; for dev only!
    framework: process.env.LIB ? 'all' : {
      components: [/* Manually imported in each component */],

      directives: [/* Manually imported in each component */],

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
      devtool: 'source-map',
      sourceMap: true,
      extendWebpack (cfg) {
        // cfg.plugins.push(new BundleAnalyzerPlugin())

        const pkg = require('./package.json')
        cfg.plugins.push(
          new webpack.DefinePlugin({
            _VERSION: JSON.stringify(pkg.version),
            _RELEASE: JSON.stringify(pkg.name + '@' + pkg.version),
            'process.env.CONFIG_PATH': JSON.stringify(
              'src/config/' + cfg.mode + (process.env.CONFIG ? '-' + process.env.CONFIG : '')
            )
          })
        )

        const htmlWebpackPlugin = cfg.plugins.find(plugin => plugin.constructor === HtmlWebpackPlugin)
        htmlWebpackPlugin.options.clientVersion = Math.floor(Date.now() / 1000)

        if (process.env.LIB && cfg.mode === 'production') {
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

          const miniCssExtractPlugin = new MiniCssExtractPlugin({
            filename: 'giscube-geoportal.min.css',
            chunkFilename: 'giscube-geoportal.min.css'
          })
          const index = cfg.plugins.findIndex(plugin => plugin.constructor === MiniCssExtractPlugin)
          cfg.plugins[index] = miniCssExtractPlugin

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
      open: false // opens browser window automatically
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
