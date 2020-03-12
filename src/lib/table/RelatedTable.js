import { isVoid } from 'src/lib/utils'

import { toRows } from './row'
import RelatedRemote from './RelatedRemote'

export default class RelatedTable {
  constructor (table, fk) {
    this.parent = table
    this.remote = new RelatedRemote(table.remote.source, fk, table.remote.getConfig)
    this.rows = new Map()
    this.fk = fk
    this.relatedTables = []
  }

  async fetchInfo () {
    const info = await this.remote.fetchInfo()
    this.relatedTables = info.fks.map(fk => new RelatedTable(this, fk))
    await Promise.all(this.relatedTables.map(table => table.fetchInfo()))
    info.setup(this.relatedTables)
    this.info = info
    return info
  }

  async update () {
    const ids = new Set(
      this.parent.rows
        .map(row => this.fk.getValue({ row }))
        .filter(id => !this.rows.has(id))
    )

    const data = await this.remote.requestData(ids)
    if (isVoid(data)) {
      // Cancelled
      return
    }
    for (let row of toRows(this, data)) {
      const pk = row.pk
      if (!ids.has(pk)) {
        console.warn(`"${pk}" is not part of the set of requested ids ${ids}`)
      }
      this.rows.set(pk, row)
    }

    await Promise.all(this.relatedTables.map(table => table.update()))
  }

  getRow (id) {
    return this.rows.get(id)
  }
}
