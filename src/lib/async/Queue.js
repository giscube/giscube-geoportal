export default class AsyncQueue {
  constructor () {
    this.asyncValues = []
    this.running = false
  }

  get runnable () {
    return !this.running && this.asyncValues.length > 0
  }

  run () {
    if (!this.runnable) {
      return
    }

    this.running = true

    return new Promise((resolve, reject) => {
      // Alows other work to be done before starting to run
      setTimeout(() => {
        this._doRun().then(resolve, reject)
      }, 0)
    })
  }

  async _doRun () {
    let retry

    while (this.asyncValues.length > 0) {
      retry = []
      while (this.asyncValues.length > 0) {
        const asyncValue = this.asyncValues.shift()
        if (!asyncValue.usable) {
          continue
        }
        if (asyncValue.delay) {
          retry.push(asyncValue)
          continue
        }

        try {
          await asyncValue.retrieve()
        } catch (error) {
          // Another one should do it
        }
      }
      if (retry.length > 0) {
        this.asyncValues = retry
        // allow other async coroutines to kick in
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    this.running = false
  }

  add (asyncValue) {
    this.asyncValues.push(asyncValue)
    return this
  }
}
