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
    while (this.asyncValues.length > 0) {
      const asyncValue = this.asyncValues.shift()
      if (!asyncValue.usable) {
        continue
      }

      try {
        await asyncValue.retrieve()
      } catch (error) {
        // Another one should do it
      }
    }

    this.running = false
  }

  add (asyncValue) {
    this.asyncValues.push(asyncValue)
    return this
  }
}
