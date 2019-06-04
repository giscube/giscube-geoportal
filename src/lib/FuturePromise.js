import debounce from 'lodash/debounce.js'
import { INTERNAL_PROPERTY } from 'src/lib/utils'

/**
FuturePromise

This class is useful when you need to attach to a promise that doesn't yet
exist. Really useful in debounce of a function that returns a promise.
*/
export default class FuturePromise {
  constructor () {
    this.newPromise()
  }

  /// Makes a new property, (resets attachments)
  newPromise () {
    this.promise = new Promise((resolve, reject) => {
      Object.defineProperties(this, {
        _resolve: {
          ...INTERNAL_PROPERTY,
          value: resolve
        },
        _reject: {
          ...INTERNAL_PROPERTY,
          value: reject
        }
      })
    })
  }

  /// Attaches the promise to the current one. Resets promise to a new one
  attach (promise) {
    const resolve = this._resolve
    const reject = this._resolve
    this.newPromise()

    // forward to the internal promise
    promise.then(resolve, reject)
  }
}

/**
promisedDebounce

Debounce a function that returns a promise. Returns a promise that will be
resolved/rejected together with the resulting promise of the debouced function.
*/
export function promisedDebounce (func, ...args) {
  const futurePromise = new FuturePromise()
  const debounced = debounce(() => {
    futurePromise.attach(func())
  }, ...args)

  return function () {
    debounced.apply(this, arguments)
    return futurePromise.promise
  }
}
