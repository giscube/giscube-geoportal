import Vue from 'vue'

export const MSG_SIZE_LIMIT = 1000

function _notify (message, config) {
  if (message.message) {
    message = message.message
  }

  if (!message) {
    message = 'Unknwon error'
  }

  message = message.toString().substring(0, MSG_SIZE_LIMIT)

  const dismiss = Vue.prototype.$q.notify({
    position: 'top',
    timeout: 0,
    actions: [
      {
        icon: 'clear',
        handler () {
          dismiss()
        },
        color: 'white',
        dense: true
      }
    ],
    message,
    ...config
  })
}

export function notify (message, config = {}) {
  Vue.nextTick(() => _notify(message, config))
}

export function notifyError (message, config = {}) {
  notify(message, { color: 'negative', ...config })
}

export function notifyHttpError (error, details = true) {
  if (error.response) {
    let message = `Error ${error.response.status} (${error.response.statusText})`
    if (details) {
      let m = error.response.data
      if (typeof m === 'object') {
        m = m.detail
      }

      const isHTML = /^\s*<(?:!DOCTYPE|html)/i.test(m)
      if (m && !isHTML) {
        message += `: ${m}`
      }
    }
    notifyError(message)
  } else {
    notifyError('Network error')
  }
}
