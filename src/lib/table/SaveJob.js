import { AsyncJob } from 'src/lib/async'

export default class SaveJob extends AsyncJob {
  constructor (remote, rowChanges) {
    const func = () => this.saveChanges()
    super({ func }, Array.from(rowChanges.dependencies))

    this.remote = remote
    this.rowChanges = rowChanges
    this.incrementReference()
  }

  saveChanges () {
    if (!this.repr) {
      this.repr = this.rowChanges.repr()
    }
    return this.remote.save(this.repr)
  }
}
