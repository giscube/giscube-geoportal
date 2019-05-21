import { Dialog } from 'quasar'

export function setPrinting (context, value) {
  if (value) {
    document.documentElement.setAttribute('data-print', '')
  } else {
    document.documentElement.removeAttribute('data-print')
  }
  context.commit('printing', !!value)
  context.dispatch('map/invalidateSize', void 0, { root: true })
}

export function setLeftDrawerSize (context, value) {
  context.commit('leftDrawerSize', value)
  context.dispatch('map/invalidateOffset', void 0, { root: true })
}

export function setSidebarVisible (context, value) {
  context.commit('sidebarVisible', value)
  context.dispatch('map/invalidateOffset', void 0, { root: true })
}

export function createDialog (context, config) {
  const dialog = Dialog.create(config)
  context.commit('addDialog', dialog)
  return dialog.onDismiss(() => {
    context.commit('removeDialog', dialog)
  })
}
