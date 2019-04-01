import Field from './Field'

import BooleanField from './BooleanField'
import ChoicesField from './ChoicesField'
import NumberField from './NumberField'
import PkField from './PkField'

export const fields = {
  default: Field,

  boolean: BooleanField,
  choices: ChoicesField,
  number: NumberField,
  pk: PkField
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
      readonly: fieldInfo.readonly,
      size: fieldInfo.size,
      decimals: fieldInfo.decimals
    }

    if (fieldInfo.name === layerInfo.pk_field) {
      field.pk = true
    }
    if (fieldInfo.name === layerInfo.geom_field) {
      field.geom = true
    }
    if (fieldInfo.values_list) {
      const valuesList = fieldInfo.values_list
      if (Array.isArray(valuesList) && valuesList.length > 0) {
        field.valuesList = []
        field.valuesDict = {}
        for (let value of valuesList) {
          if (Array.isArray(value)) {
            field.valuesDict[value[0]] = value[1]
            field.valuesList.push({ value: value[0], label: value[1] })
          } else {
            field.valuesDict[value] = value
            field.valuesList.push({ value, label: value })
          }
        }
      }
    }

    // generate a field from the field
    const F = field.pk ? fields['pk'] : getFieldClass(fieldInfo.widget)
    return new F(field)
  })
}
