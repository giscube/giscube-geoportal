import Vue from 'vue'
import { notifyError, notifyHttpError } from './notifications'

function except (error) {
  const self = except
  if (error instanceof ErrorEvent) {
    error = error.error // extract the error from the event
  }
  self._sentry(error)
  self._log(error)
  self._notify(error)
}
Object.assign(except, {
  http (error, details = true) {
    this._sentry(error)
    this._log(error)
    this._notifyHttp(error, details)
  },
  vue (error, vm, info) {
    this._sentry(error)
    this._vue(error, vm, info)
    this._log(error)
    this._notify(error)
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
