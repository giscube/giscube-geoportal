import { isVoid } from 'src/lib/utils'

export default class AsyncJob {
  constructor (job, dependencies = []) {
    if (typeof job.func !== 'function') {
      throw TypeError('`func` is required and must be a function')
    }
    if (job.args && !Array.isArray(job.args)) {
      throw TypeError('`args` must be an array')
    }
    if (job.cancel && typeof job.cancel !== 'function') {
      throw TypeError('`cancel` must be a function')
    }

    // Define frozen interface
    this.job = {
      func: job.func,
      args: job.args || [],
      data: job.data,
      cancel: job.cancel || (() => {})
    }
    this.result = void 0
    this.errors = []
    this._state = {
      _retries: isVoid(job.retries) || isNaN(job.retries) ? Infinity : job.retries,
      cancelled: false,
      postponed: false,
      usedBy: 0,
      done: false,
      promise: null,
      resolve: null,
      reject: null
    }
    this.dependencies = dependencies

    this._state.promise = new Promise((resolve, reject) => {
      this._state.resolve = resolve
      this._state.reject = reject
    })
  }

  get done () {
    return this._state.done
  }

  get usable () {
    return !this._state.cancelled && this._state.usedBy > 0
  }

  get cancelled () {
    return this._state.cancelled || isNaN(this._state.usedBy)
  }

  get delay () {
    return !this.dependencies.every(value => value.finished)
  }

  get finished () {
    return this._state.done || this._state.cancelled
  }

  get postponed () {
    return this._state.postponed
  }

  cancel () {
    if (!this.finished) {
      this._state.cancelled = true
      this.job.cancel()
    }
  }

  getOrThrow () {
    if (this.done) {
      return this.result
    } else if (this.cancelled) {
      throw new Error('AsyncJob cancelled')
    } else {
      throw new Error('AsyncJob not ready')
    }
  }

  get (defaultValue = undefined) {
    if (this.done) {
      return this.result
    } else {
      return defaultValue
    }
  }

  incrementReference (n = 1) {
    const status = this._state
    if (!this.cancelled) {
      status.usedBy += n
    }
    return status.usedBy
  }

  decrementReference (n = 1) {
    const status = this._state
    status.usedBy -= n
    if (status.usedBy <= 0) {
      status.usedBy = NaN
      if (!this.done) {
        this.job.cancel()
      }
    }
    return status.usedBy
  }

  async work () {
    this._state.postponed = false
    try {
      const result = await this.job.func.apply(this.job, this.job.args)
      if (result !== AsyncJob.retry) {
        this.result = result
        this._state.done = true
        this._state.resolve(result)
      }
    } catch (error) {
      this.errors.push(error)
      if (this._state._retries > 0) {
        this._state.postponed = true
        this._state._retries -= 1
      } else {
        this._state.done = true
        if (!this.cancelled) {
          this._state.reject(error)
        }
      }
    }
  }

  static is (obj) {
    return obj instanceof AsyncJob
  }

  // Promise-like interface functions
  asPromise () {
    return new Promise((resolve, reject) => this._state.promise.then(resolve, reject))
  }

  then (...args) {
    return this._state.promise.then(...args)
  }

  catch (...args) {
    return this._state.promise.catch(...args)
  }

  finally (...args) {
    return this._state.promise.finally(...args)
  }
}

AsyncJob.retry = Symbol('AsyncJob retry')
