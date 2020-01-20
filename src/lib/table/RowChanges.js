import SaveJob from './SaveJob'

export default class RowChanges {
  constructor (rows) {
    this.persistentRows = []
    this.changedRows = []
    this.changes = {
      ADD: [],
      UPDATE: [],
      DELETE: []
    }
    this.dependencies = new Set()

    for (let row of rows) {
      if (row.status.new && row.status.deleted) {
        // Cancel any async value because they won't be used
        for (let value of row.asyncValues) {
          value.cancel()
        }
      } else {
        if (!row.status.deleted) {
          this.persistentRows.push(row)
        }
        if (row.status.new || row.status.edited || row.status.deleted) {
          this.changedRows.push(row)
          this.consolidateChanges(row)
        }
      }
    }
  }

  consolidateChanges (row) {
    // Get data changes
    const changes = row.consolidateChanges()
    if (changes) {
      for (let key in changes) {
        if (changes[key]) {
          this.changes[key].push(changes[key])
        }
      }
    }
    // Set dependencies
    for (let d of row.dependencies) {
      this.dependencies.add(d)
    }
  }

  asSaveJob (remote) {
    return new SaveJob(remote, this.changedRows, this.changes, this.dependencies)
  }
}
