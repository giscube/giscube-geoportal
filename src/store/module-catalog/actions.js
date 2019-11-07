import Vue from 'vue'
import axios from 'axios'
import CatalogResult from 'src/lib/CatalogResult'

export function categoryChange (context, category) {
  category.subcategories.forEach(subcategory => {
    context.dispatch('subcategoryChange', subcategory)
  })
}

export function checkCategories (context) {
  if (context.state.categories.length > 0) {
    return
  }
  context.commit('loading', true)
  const catalog = this.$config.catalog
  const config = catalog.auth ? context.rootGetters['auth/config'] : {}
  axios.get(catalog.categories, config)
    .then(response => {
      context.state.categories = response.data
      context.state.categories.forEach(category => {
        if (category.parent == null) {
          context.dispatch('getSubcategories', category.id).then(subcategories => {
            category.subcategories = subcategories
          })
        }
      })
    })
    .catch(this.$except)
    .then(() => {
      context.commit('loading', false)
    })
}

export async function getResultById (context, id) {
  const catalog = this.$config.catalog
  const config = catalog.auth ? context.rootGetters['auth/config'] : {}
  const url = `${catalog.base}/geoportal/giscube_id/${id}`

  const response = await axios.get(url, config)
  const result = response.data.results[0]

  context.commit('search/result', result, { root: true })
  return result
}

export function getSubcategories (context, id) {
  return context.state.categories.filter(category => {
    return category.parent === id
  })
}

export function getSubcategoriesResults (context, category) {
  const catalog = this.$config.catalog
  const config = catalog.auth ? context.rootGetters['auth/config'] : {}
  const url = `${catalog.search}?category_id=${category.id}`
  axios.get(url, config)
    .then(response => {
      const results = response.data.results.map(CatalogResult.create)
      Vue.set(category, 'results', results)
    })
    .catch(this.$except)
    .then(() => {
      Vue.delete(category, 'loading')
    })
}

export function onShowSubcategory (context, subcategory) {
  context.dispatch('subcategoryChange', subcategory)
}

export function setCategories (context, categories) {
  context.state.categories = categories
}

export function subcategoryChange (context, category) {
  if (category.results === undefined) {
    Vue.set(category, 'loading', true)
    context.dispatch('getSubcategoriesResults', category)
  }
}
