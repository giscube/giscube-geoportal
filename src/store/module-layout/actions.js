import { Dialog } from 'quasar'
import Vue from 'vue'

import { ProgrammingError } from 'src/lib/except'
import { noop } from 'src/lib/utils'

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
  context.dispatch('setMapLeft')
  context.dispatch('map/invalidateOffset', void 0, { root: true })
}

export function setSidebarVisible (context, value) {
  context.commit('sidebarVisible', value)
  context.dispatch('setMapLeft')
  context.dispatch('map/invalidateOffset', void 0, { root: true })
}

export function setMapLeft (context) {
  const hasLeft = !context.getters.drawersFullOverlay && context.state.sidebarVisible
  const size = hasLeft ? `${context.state.leftDrawerSize + 5}px` : '0px'
  document.documentElement.style.setProperty('--map-left', size)
}

export function showMapWhile (context, promise) {
  if (context.getters.drawersFullOverlay && context.state.sidebarVisible) {
    context.dispatch('setSidebarVisible', false)
    promise.then(() => {}, () => {}).then(_ => {
      context.dispatch('setSidebarVisible', true)
    })
  }
}

export function pushLengthState (context) {
  const l = context.state.dialogs.length
  this.$router.push({
    ...this.$router.currentRoute,
    hash: l > 0 ? `#${l}` : ''
  }).catch(noop)
}

export function createDialog (context, config) {
  const handlers = {
    close: null
  }
  Vue.observable(handlers)

  if (!(config.component instanceof Object) && !config.message) {
    throw new ProgrammingError('Cannot make a dialog without a component to put in it.')
  }

  const api = Dialog.create({
    noRouteDismiss: true,
    ...config,
    dialogHandlers: handlers
  })

  const dialog = { api, handlers }
  context.commit('addDialog', dialog)
  api.onDismiss(() => {
    // DO NOT MAKE IT ASYNC
    context.commit('removeDialog', dialog)
    context.dispatch('pushLengthState')
  })

  context.dispatch('pushLengthState')

  return api
}

export async function applyDialogs (context, { to, from, next }) {
  const steps = to.hash.length > 1 ? to.hash.match(/\d+/g).map(parseInt) : [0]
  const target = steps[0]
  const current = context.state.dialogs.length

  if (target === current) {
    next()
  } else if (target > current) {
    next({
      ...to,
      hash: `#${current}~${steps.join('~')}`,
      replace: true
    })
  } else {
    let i = current - 1
    while (i >= target) {
      let closed = await context.dispatch('tryClosingDialog', i)
      if (!closed) {
        break
      }
      i = context.state.dialogs.length - 1
    }

    if (i === target) {
      next()
    } else {
      next({
        ...to,
        hash: i === 0 ? '' : `#${i}`
      })
    }
  }
}

export async function tryClosingDialog (context, i) {
  const dialog = context.state.dialogs[i]
  const close = dialog.handlers.close
  let result = false
  if (typeof close === 'function') {
    result = await close()
    if (result) {
      context.commit('removeDialog', dialog)
    }
  } else {
    await new Promise(resolve => {
      dialog.api.onDismiss(() => {
        // When using hide() the cleanup hook will be called
        // Quasar's dialog API follow the order that the event handlers have
        // been set; thus, at this point, the dialog has already been removed.
        resolve()
      })
      dialog.api.hide()
    })
    result = true
  }
}
