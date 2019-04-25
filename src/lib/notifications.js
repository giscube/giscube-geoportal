import Vue from 'vue'

function _notify (message, config) {
  if (message instanceof Error) {
    message = message.message
  }

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

      if (m) {
        message += `: ${m}`
      }
    }
    notifyError(message)
  } else {
    notifyError('Network error')
  }
}
