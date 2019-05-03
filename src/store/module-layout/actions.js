export function setPrinting (context, value) {
  if (value) {
    document.documentElement.setAttribute('data-print', '')
  } else {
    document.documentElement.removeAttribute('data-print')
  }
  context.commit('printing', !!value)
  context.dispatch('map/invalidateSize', void 0, { root: true })
}
