import { merge } from 'lodash'
import { RELEASE } from '../meta'
import except from 'src/lib/except.js'

export default async ({ Vue }) => {
  const config = Vue.prototype.$config
  merge(except.config, config.except || {})

  window.addEventListener('error', except)
  Vue.config.errorHandler = except.vue

  // Sentry setup
  if (process.env.NODE_ENV === 'production' && config.sentry.dsn) {
    const Sentry = require('@sentry/browser')
    const Integrations = require('@sentry/integrations')

    Sentry.init({
      dsn: config.sentry.dsn,
      release: RELEASE,
      integrations: [new Integrations.Vue({ Vue })]
    })

    except.setSentry(Sentry)
  }

  // Shortcut
  Vue.prototype.$except = except
}
