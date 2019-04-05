import Field from './Field'

import BooleanField from './BooleanField'
import ChoicesField from './ChoicesField'
import NumberField from './NumberField'
import LinkedField from './LinkedField'
import PkField from './PkField'
import SqlChoicesField from './SqlChoicesField'

export const fields = {
  default: Field,

  boolean: BooleanField,
  choices: ChoicesField,
  number: NumberField,
  linkedfield: LinkedField,
  pk: PkField,
  sqlchoices: SqlChoicesField
}

function getFieldClass (field, fieldInfo) {
  return field.pk ? fields['pk'] : fields[fieldInfo.widget] || fields['default']
}

export function buildFields (layerInfo) {
  const fields = layerInfo.fields.map(fieldInfo => {
    // Add all the values of the field
    const field = {
      null: fieldInfo.null,
      name: fieldInfo.name,
      label: fieldInfo.label || fieldInfo.name,
      readonly: fieldInfo.readonly
    }

    const conditionalCopyList = ['size', 'decimals', 'values_list', 'values_list_headers']
    conditionalCopyList.forEach(name => {
      if (name in fieldInfo) {
        field[name] = fieldInfo[name]
      }
    })

    field.pk = (fieldInfo.name === layerInfo.pk_field)
    field.geom = (fieldInfo.name === layerInfo.geom_field)

    if (fieldInfo.widget === 'linkedfield') {
      const options = JSON.parse(fieldInfo.widget_options)
      field.source = options['source']
      field.column = options['column']

      const property = options['property']
      field.property = property ? property.split('.') : []
    }

    // generate a field from the field info
    const F = getFieldClass(field, fieldInfo)
    return new F(field)
  })

  fields.forEach(field => {
    if (field instanceof LinkedField) {
      field.sourceField = fields.find(f => f.name === field.source)
    }
  })

  return fields
}
