import { Notify } from 'quasar'

export function notify (message, config) {
  if (message instanceof Error) {
    message = message.message
  }

  Notify.create({
    position: 'top',
    timeout: 2500,
    message,
    ...config
  })
}

export function notifyError (message, config) {
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
