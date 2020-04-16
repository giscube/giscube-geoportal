import Row from './Row'

export default class GeoJsonRow extends Row {
  generatePk (data) {
    this.pk = data && data.id
  }

  getEmpty () {
    return {
      type: 'Feature',
      properties: {}
    }
  }

  copyPk (obj, pk) {
    obj.id = pk
  }

  setPk (pk) {
    this.pk = pk
  }
}
