export default class AsyncQueue {
  constructor () {
    this.asyncJobs = []
    this.running = false
  }

  get runnable () {
    return !this.running && this.asyncJobs.length > 0
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

    while (this.asyncJobs.length > 0) {
      retry = []
      while (this.asyncJobs.length > 0) {
        const asyncJob = this.asyncJobs.shift()

        if (!asyncJob.usable) {
          continue
        }
        if (asyncJob.delay) {
          retry.push(asyncJob)
          continue
        }

        try {
          await asyncJob.retrieve()
        } catch (error) {
          // Another one should do it
        }
      }
      if (retry.length > 0) {
        this.asyncJobs = retry
        // allow other async coroutines to kick in
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    this.running = false
  }

  add (asyncJob) {
    this.asyncJobs.push(asyncJob)
    return this
  }
}
