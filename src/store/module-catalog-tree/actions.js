import axios from 'axios'
import CatalogTreeResult from '../../lib/CatalogTreeResult'

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
      context.dispatch('createCatalog')
    })
    .catch(this.$except)
    .then(() => {
      context.commit('loading', false)
    })
}

export function createCatalog (context) {
  let catalog = []
  const categoriesPromises = []
  context.state.categories.forEach(category => {
    if (category.parent === null) {
      categoriesPromises.push(
        context.dispatch('getChildren', category).then(children => {
          const node = {
            children: children,
            data: category,
            header: 'root',
            id: category.id,
            label: category.name,
            noTick: true
          }

          if (category.content) {
            node.children.push(..._createLeaves(category.content))
          }

          catalog.push(node)
        })
      )
    }
  })
  Promise.all(categoriesPromises).then(() => {
    if (this.$config.catalog.filter) {
      this.$config.catalog.filter(this, catalog)
    }
    context.commit('setCatalog', catalog)
  })
}

function _createLeaves (contents) {
  return contents.map(content => {
    return CatalogTreeResult.create({
      data: content,
      header: 'leaf',
      id: content.giscube_id,
      label: content.title
    })
  })
}

export function getChildren (context, parent) {
  let subcategories = context.state.categories.filter(child => child.parent === parent.id)
  if (subcategories.length > 0) {
    subcategories = subcategories.reduce(function (_children, child) {
      context.dispatch('getChildren', child).then(children => {
        const node = {
          children: children,
          data: child,
          header: 'branch',
          id: child.id,
          label: child.name
        }

        if (child.content) {
          node.children.push(..._createLeaves(child.content))
        }

        if (node.children.length > 0) {
          _children.push(node)
        }
      })
      return _children
    }, [])
  }

  return subcategories
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

export function searchInCatalog (context, id) {
  const catalog = context.state.catalog
  for (let i = 0; i < catalog.length; i++) {
    const leaf = _searchInCatalogRecursive(id, catalog[i])
    if (leaf) {
      return leaf
    }
  }
}

function _searchInCatalogRecursive (id, branch) {
  if (branch.id === id) {
    return branch
  } else if (branch.children) {
    for (let i = 0; i < branch.children.length; i++) {
      const result = _searchInCatalogRecursive(id, branch.children[i])
      if (result) {
        return result
      }
    }
  }
}
