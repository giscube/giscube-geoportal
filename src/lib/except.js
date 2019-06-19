import Vue from 'vue'
import { notifyError, notifyHttpError } from './notifications'

const INTERNAL_ERROR_CLASSES = [
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError
]

function isInvalidObject (error) {
  return typeof error !== 'object' || error === null
}

function isInternalError (error) {
  return isInvalidObject(error) || INTERNAL_ERROR_CLASSES.some(ErrorClass => error instanceof ErrorClass)
}

function isAxiosError (error) {
  return !!(error.config && (error.config.url || error.config.baseUrl) && error.config.method)
}

function except (error, { hide = false } = {}) {
  const self = except
  if (typeof error === 'object' && !!error && error instanceof ErrorEvent && error.error) {
    error = error.error // extract the error from the event
  }

  if (isInternalError(error)) {
    if (isInvalidObject(error)) {
      self._sentry(`Error with non error type: "${error}" (${typeof error})`)
    } else {
      self._sentry(error)
    }
    self._log(error)

    if (!hide) {
      self._notify('Internal error')
    }
  } else if (isAxiosError(error)) {
    const details = (error.code >= 400 && error.code < 500)
    self._sentry(error)
    self._log(error)

    if (!hide) {
      self._notifyHttp(error, details)
    }
  } else {
    self._sentry(error)
    self._log(error)

    if (!hide) {
      self._notify(error)
    }
  }
}
Object.assign(except, {
  config: {
    silent: false
  },

  vue (error, vm, info) {
    const self = except
    self._sentry(error)
    self._vue(error, vm, info)
    self._log(error)
    self._notify(error)
  },

  setSentry (Sentry) {
    this._sentry = function (error) {
      if (error instanceof Error) {
        Sentry.captureException(error)
      } else {
        Sentry.captureMessage(error.toString())
      }
    }
  },

  _log: console.error,
  _notify () {
    if (!this.config.silent) {
      notifyError.apply(null, arguments)
    }
  },
  _notifyHttp () {
    if (!this.config.silent) {
      notifyHttpError.apply(null, arguments)
    }
  },
  _sentry () { /* Does nothing by default. Gets overriden by setSentry */ },
  _vue (error, vm, info) {
    Vue.util.warn(error, vm)
  }
})

export { except, except as default }
