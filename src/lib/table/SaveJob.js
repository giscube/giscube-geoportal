import { AsyncJob } from 'src/lib/async'

export default class SaveJob extends AsyncJob {
  constructor (remote, rows, changes, dependencies) {
    const func = () => remote.save(changes)
    super({ func }, Array.from(dependencies))
    rows.forEach(row => row.asyncJobs.add(this))
    this.finally(() => {
      rows.forEach(row => row.asyncJobs.delete(this))
    })

    this.incrementReference()
  }
}
