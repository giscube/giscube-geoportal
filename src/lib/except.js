import Vue from 'vue'
import { notifyError, notifyHttpError } from './notifications'

function except (error) {
  const self = except
  if (error instanceof ErrorEvent && error.error) {
    error = error.error // extract the error from the event
  }
  self._sentry(error)
  self._log(error)
  self._notify(error)
}
Object.assign(except, {
  http (error, details = true) {
    const self = except
    self._sentry(error)
    self._log(error)
    self._notifyHttp(error, details)
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
  _notify: notifyError,
  _notifyHttp: notifyHttpError,
  _sentry () { /* Does nothing by default. Gets overriden by setSentry */ },
  _vue (error, vm, info) {
    Vue.util.warn(error, vm)
  }
})

export { except, except as default }
