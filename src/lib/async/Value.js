export default class AsyncValue {
  constructor (job) {
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
    this.result = this.error = undefined
    this._state = {
      usedBy: 0,
      done: false,
      promise: null,
      resolve: null,
      reject: null
    }

    this._state.promise = new Promise((resolve, reject) => {
      this._state.resolve = resolve
      this._state.reject = reject
    })
  }

  get done () {
    return this._state.done
  }

  get usable () {
    return this._state.usedBy > 0
  }

  get cancelled () {
    return isNaN(this._state.usedBy)
  }

  getOrThrow () {
    if (this.done) {
      return this.result
    } else {
      throw new Error('AsyncValue not ready')
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

  getValue () {
    return this._state.promise
  }

  retrieve () {
    return new Promise((resolve, reject) => {
      const promise = this.job.func.apply(this.job, this.job.args)
      if (!(promise instanceof Promise)) {
        this._state.resolve(promise)
        resolve()
        return
      }

      promise
        .then(result => {
          this.result = result
          this._state.done = true
          this._state.resolve(result)
          resolve()
        })
        .catch(error => {
          this.error = error
          this._state.done = true
          if (!this.cancelled) {
            this._state.reject(error)
          }
          throw error
        })
        .catch(reject) // catch absolutely all errors
    })
  }

  static is (obj) {
    return obj instanceof AsyncValue
  }
}
