import Field from './Field'

import BooleanField from './BooleanField'
import ChoicesField from './ChoicesField'
import DateField from './DateField'
import DateTimeField from './DateTimeField'
import ImageField from './ImageField'
import NumberField from './NumberField'
import LinkedField from './LinkedField'
import PkField from './PkField'
import SqlChoicesField from './SqlChoicesField'
import TableField from './TableField'
import TimeField from './TimeField'

export const FIELDS = {
  default: Field,

  boolean: BooleanField,
  choices: ChoicesField,
  date: DateField,
  datetime: DateTimeField,
  image: ImageField,
  number: NumberField,
  linkedfield: LinkedField,
  pk: PkField,
  relation1n: TableField,
  sqlchoices: SqlChoicesField,
  time: TimeField
}

function getFieldClass (field, fieldInfo) {
  return field.pk ? FIELDS.pk : FIELDS[fieldInfo.widget] || FIELDS.default
}

function makeField ({ layerInfo, fieldInfo, constFields, virtual = false } = {}) {
  // Add all the values of the field
  const constant = constFields.hasOwnProperty(fieldInfo.name)
  const field = {
    virtual,
    constant,
    null: fieldInfo.null,
    name: fieldInfo.name,
    label: fieldInfo.label || fieldInfo.name,
    readonly: fieldInfo.readonly || constant
  }

  const conditionalCopyList = ['size', 'decimals', 'values_list', 'values_list_headers', 'widget_options']
  conditionalCopyList.forEach(name => {
    if (name in fieldInfo) {
      field[name] = fieldInfo[name]
    }
  })

  field.pk = (fieldInfo.name === layerInfo.pk_field)
  field.geom = (fieldInfo.name === layerInfo.geom_field)

  // generate a field from the field info
  const F = getFieldClass(field, fieldInfo)
  return new F(field)
}

export function buildFields (layerInfo, constFields = {}) {
  const fields = layerInfo.fields.map(fieldInfo => makeField({ layerInfo, fieldInfo, constFields }))
  layerInfo.virtual_fields.forEach(fieldInfo => fields.push(makeField({ layerInfo, fieldInfo, constFields, virtual: true })))

  fields.forEach(field => {
    if (field.onFieldsCreated) {
      field.onFieldsCreated(fields)
    }
  })

  return fields
}
