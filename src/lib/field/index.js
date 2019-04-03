import Field from './Field'

import BooleanField from './BooleanField'
import ChoicesField from './ChoicesField'
import NumberField from './NumberField'
import PkField from './PkField'
import SqlChoicesField from './SqlChoicesField'

export const fields = {
  default: Field,

  boolean: BooleanField,
  choices: ChoicesField,
  number: NumberField,
  pk: PkField,
  sqlchoices: SqlChoicesField
}

function getFieldClass (name) {
  return fields[name] || fields['default']
}

export function buildFields (layerInfo) {
  return layerInfo.fields.map(fieldInfo => {
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

    // generate a field from the field
    const F = field.pk ? fields['pk'] : getFieldClass(fieldInfo.widget)
    return new F(field)
  })
}
