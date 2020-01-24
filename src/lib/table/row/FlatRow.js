import Row from './Row'

export default class FlatRow extends Row {
  generatePk () {
    this.pk = this.info.pkField.getValue({ row: this })
  }

  setPk (obj, pk) {
    this.info.pkField.setValue({ properties: obj, value: pk })
  }
}
