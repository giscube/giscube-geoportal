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
    let postponed = 0
    let retry

    while (this.asyncJobs.length > 0 || postponed > 0) {
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

        await asyncJob.work()
        if (asyncJob.postponed) {
          postponed += 1
          setTimeout(() => {
            postponed -= 1
            this.asyncJobs.push(asyncJob)
          }, 5_000)
        } else if (!asyncJob.done) {
          retry.push(asyncJob)
        }
      }
      if (retry.length > 0) {
        Array.prototype.push.apply(this.asyncJobs, retry)
        // allow other async coroutines to kick in
        await new Promise(resolve => setTimeout(resolve, 0))
      }

      if (postponed > 0) {
        await new Promise(resolve => setTimeout(resolve, 5_000))
      }
    }

    this.running = false
  }

  add (asyncJob) {
    this.asyncJobs.push(asyncJob)
    return this
  }
}
