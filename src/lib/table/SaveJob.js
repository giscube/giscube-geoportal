import { AsyncJob } from 'src/lib/async'

export default class SaveJob extends AsyncJob {
  constructor (remote, rowChanges, postSave) {
    const func = () => this.saveChanges()
    super({ func }, Array.from(rowChanges.dependencies))

    this.remote = remote
    this.rowChanges = rowChanges
    this.postSave = postSave
    this.incrementReference()
  }

  async saveChanges () {
    if (!this.repr) {
      this.repr = this.rowChanges.repr()
    }
    const response = await this.remote.save(this.repr)
    await this.postSave(response)
    return response
  }
}
