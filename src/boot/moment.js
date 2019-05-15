import moment from 'moment'

export default async ({ Vue }) => {
  const locale = Vue.prototype.$config.locale
  const locales = [locale.main]
  if (locale.fallback) {
    locales.push(locale.fallback)
  }

  moment.locale(locales)

  Vue.prototype.$moment = moment
}
