<template>
  <div>
    <data-field
      v-for="field in fields"
      :key="field.name"
      v-model="agregateProperties"
      @input="$emit('change', $event)"
      :label="field.label || field.name"
      :disable="disable"
      :readonly="readonly"
      :fieldInfo="field"
    />

  </div>
</template>

<script>
import DataField, { MultiResult } from './DataField.js'

export default {
  props: {
    fields: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    disable: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  components: {
    DataField
  },
  data () {
    return {
      agregateProperties: null
    }
  },
  watch: {
    data: {
      handler (newData) {
        const agregateProperties = {}

        for (let field of this.fields) {
          let current
          for (let e of newData) {
            let value = e.properties[field.name]
            if (value === '' || value === undefined) {
              value = null
            }
            if (current === undefined) {
              current = value
            } else if (MultiResult.is(current)) {
              current.values.add(value)
            } else if (current !== value) {
              current = new MultiResult([value, current])
            }
          }

          agregateProperties[field.name] = current
        }

        this.agregateProperties = agregateProperties
      },
      immediate: true
    }
  }
}
</script>
