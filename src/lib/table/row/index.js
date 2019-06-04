import Row from './Row'
import FlatRow from './FlatRow'
import GeoJsonRow from './GeoJsonRow'

export function toRow (parent, row) {
  const Class = parent.info.hasGeom ? GeoJsonRow : FlatRow
  return new Class(parent, row)
}

export function toRows (parent, data) {
  const rows = parent.info.rowsPath.extractFrom(data)
  return rows.map(row => toRow(parent, row))
}

export {
  Row,
  FlatRow,
  GeoJsonRow,
  Row as default
}
