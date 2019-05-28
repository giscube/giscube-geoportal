import VueI18n from 'vue-i18n'
import messages from 'src/i18n'

import config from '../config'

export default async ({ app, Vue }) => {
  Vue.use(VueI18n)

  // Set i18n instance on app
  const { main, fallback } = config.locale
  const options = {
    locale: main,
    messages
  }
  if (fallback) {
    options.fallbackLocale = fallback
  }
  app.i18n = new VueI18n(options)
  Vue.prototype._i18n = app.i18n

  let capitalize = value => value
  if (messages[main] && messages[main].capitalize) {
    capitalize = messages[main].capitalize
  } else if (fallback && messages[fallback] && messages[fallback].capitalize) {
    capitalize = messages[fallback].capitalize
  }

  Vue.filter('capitalize', capitalize)
}
