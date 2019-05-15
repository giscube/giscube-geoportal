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
import TimeField from './TimeField'

export const fields = {
  default: Field,

  boolean: BooleanField,
  choices: ChoicesField,
  date: DateField,
  datetime: DateTimeField,
  image: ImageField,
  number: NumberField,
  linkedfield: LinkedField,
  pk: PkField,
  sqlchoices: SqlChoicesField,
  time: TimeField
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
  })

  fields.forEach(field => {
    if (field instanceof LinkedField) {
      field.sourceField = fields.find(f => f.name === field.source)
    }
  })

  return fields
}
