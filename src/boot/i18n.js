import VueI18n from 'vue-i18n'
import Options from 'src/lib/options'
import original from 'src/i18n'

function setup (msgs) {
  // support to merge here and on the children's i18n folder
  let messages = original
  if (msgs) {
    if (msgs instanceof Options) {
      messages = msgs
    } else {
      messages = original.merge(msgs)
    }
  }

  return async ({ app, Vue }) => {
    const config = Vue.prototype.$config
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

    Vue.prototype.$filter = filter => Vue.filter(filter)
  }
}

const i18nBoot = setup()
i18nBoot.setup = setup

export default i18nBoot
