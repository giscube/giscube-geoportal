import axios from 'axios'

export async function getResultById (context, id) {
  const catalog = this.$config.catalog
  const config = catalog.auth ? context.rootGetters['auth/config'] : {}
  const url = `${catalog.base}/giscube_id/${id}`

  const response = await axios.get(url, config)
  const result = response.data.results[0]

  context.commit('search/result', result, { root: true })
  return result
}
