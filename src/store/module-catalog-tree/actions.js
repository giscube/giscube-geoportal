import axios from 'axios'
import CatalogTreeResult from '../../lib/CatalogTreeResult'

export function checkCategories (context, forceRefresh = false) {
  if (context.state.categories.length > 0 && !forceRefresh) {
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

function _overlaysActiveFilters (context) {
  const activeFilters = {}
  context.rootState.map.layers.overlays.forEach(overlay => {
    if (overlay.id && overlay.id.activeFilters) {
      activeFilters[overlay.id.plainRef] = overlay.id.activeFilters
    }
  })
  return activeFilters
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
            node.children.push(..._createLeaves(category.content, _overlaysActiveFilters(context)))
          }

          catalog.push(node)
        })
      )
    }
  })
  return Promise.all(categoriesPromises).then(() => {
    if (this.$config.catalog.filter) {
      this.$config.catalog.filter(this, catalog)
    }
    context.commit('setCatalog', catalog)
    Object.keys(_overlaysActiveFilters(context)).forEach(id => context.dispatch('expandToNode', id))
    return catalog
  })
}

function _createLeaves (contents, activeFilters = {}) {
  return contents.map(content => {
    const hasFilters = content.filters && content.filters.length > 0
    const active = activeFilters[content.giscube_id]
    return CatalogTreeResult.create({
      data: content,
      header: hasFilters ? 'leaf-filters' : 'leaf',
      body: hasFilters ? 'leaf-filters' : 'leaf',
      expandFilters: !!(hasFilters && active),
      id: content.giscube_id,
      label: content.title,
      filters: hasFilters && content.filters.map((filter, index) => {
        filter['active'] = !!active && active.includes(index)
        return filter
      })
    })
  }).sort((a, b) => {
    if (a.title < b.title) {
      return -1
    } else if (a.title > b.title) {
      return 1
    }
    return 0
  })
}

export async function getChildren (context, parent) {
  const subcategories = context.state.categories.filter(child => child.parent === parent.id)
  const nodes = await Promise.all(subcategories.map(async child => {
    const children = await context.dispatch('getChildren', child)
    const node = {
      children: children,
      data: child,
      header: 'branch',
      id: child.id,
      label: child.name
    }

    if (child.content) {
      node.children.push(..._createLeaves(child.content, _overlaysActiveFilters(context)))
    }

    return node
  }))

  return nodes.filter(node => node.children.length > 0)
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

function _searchPathRecursive (id, branch) {
  if (branch.id === id) {
    return [branch]
  } else if (branch.children) {
    for (let i = 0; i < branch.children.length; i++) {
      const path = _searchPathRecursive(id, branch.children[i])
      if (path) {
        return [branch, ...path]
      }
    }
  }
}

export function expandToNode (context, id) {
  const catalog = context.state.catalog
  for (let i = 0; i < catalog.length; i++) {
    const path = _searchPathRecursive(id, catalog[i])
    if (path) {
      const ancestors = path.slice(0, -1).map(node => node.id)
      const open = context.state.categoriesOpen
      const missing = ancestors.filter(ancestor => !open.includes(ancestor))
      if (missing.length > 0) {
        context.commit('setCategoriesOpen', [...open, ...missing])
      }
      return
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

export function setNodePropertyValue (context, { id, property, value }) {
  const catalog = context.state.catalog
  for (let i = 0; i < catalog.length; i++) {
    let leaf = _searchInCatalogRecursive(id, catalog[i])
    if (leaf) {
      leaf[property] = value
    }
  }
  context.state.catalog.push('changed')
  context.state.catalog.pop()
}
