import Row from './Row'

export default class FlatRow extends Row {
  generatePk () {
    this.pk = this.info.pkField.getValue({ row: this })
  }

  setPk (pk) {
    this.pk = pk
    this.copyPk(this.serverProperties, pk)
    this.copyPk(this.consolidatedProperties, pk)
    this.copyPk(this.properties, pk)
  }

  copyPk (obj, pk) {
    this.info.pkField.setValue({ properties: obj, value: pk })
  }
}
