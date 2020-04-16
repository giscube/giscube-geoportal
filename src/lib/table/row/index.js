import Row from './Row'
import FlatRow from './FlatRow'
import GeoJsonRow from './GeoJsonRow'

const ROW_TYPES = {
  'geojson': GeoJsonRow,
  'flat': FlatRow
}

export function toRow (parent, rowData, constFields) {
  const Class = ROW_TYPES[parent.info.rowType]
  return new Class(parent, rowData, constFields)
}

export function toRows (parent, data, constFields) {
  const rows = parent.info.rowsPath.extractFrom(data)
  return rows.map(row => toRow(parent, row, constFields))
}

export {
  Row,
  FlatRow,
  GeoJsonRow,
  Row as default
}
