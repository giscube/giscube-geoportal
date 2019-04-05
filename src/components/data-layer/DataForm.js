import MultiResult from '../../lib/MultiResult.js'
import { cloneClean } from '../../lib/utils.js'
import FormWidget from '../../lib/field/components/FormWidget.js'

function agregate (fields, features) {
  const agregatedProperties = {}

  for (let field of fields) {
    let current
    for (let feature of features) {
      let value = field.getValue({ feature })
      if (value === '' || value === undefined) {
        value = null
      } else {
        value = cloneClean(value)
      }

      if (current === undefined) {
        current = value
      } else if (MultiResult.is(current)) {
        current.values.add(value)
      } else if (current !== value) {
        current = new MultiResult([value, current])
      }
    }

    agregatedProperties[field.name] = current
  }

  return agregatedProperties
}

export default {
  props: ['properties', 'features', 'readonly', 'disable'],
  data () {
    return {
      agregatedProperties: this.agregateProperties()
    }
  },
  watch: {
    features () {
      this.applyAgregateProperties()
    },
    properties () {
      this.applyAgregateProperties()
    }
  },
  methods: {
    agregateProperties () {
      const fields = this.$store.getters['dataLayer/formFields']
      let properties = this.properties
      if (!properties) {
        properties = agregate(fields, this.features)
      } else if (Array.isArray(properties)) {
        properties = agregate(fields, [{ properties }])
      }
      return properties
    },
    applyAgregateProperties () {
      this.agregatedProperties = this.agregateProperties()
    },
    validate () {
      return this.$children.reduce(
        (total, children) => {
          const currentValidation = children.validate === undefined || children.validate() === true
          return total && currentValidation
        },
        true
      )
    },
    resetValidation () {
      this.$children.forEach(child => child.resetValidation())
    }
  },
  render (createElement) {
    const fields = this.$store.getters['dataLayer/formFields']
    if (!fields) {
      return
    }

    const callbacks = []
    const resolveCallbacks = () => {
      while (callbacks.length > 0) {
        const { field, value } = callbacks.shift()
        field.setValue({ properties: this.agregatedProperties, value })
        fields.forEach(f => {
          f.onUpdate(
            field,
            value,
            this.agregatedProperties,
            value => callbacks.push({ field: f, value })
          )
        })
      }
    }

    const onInput = (field, value) => {
      callbacks.push({ field, value })
      resolveCallbacks()
      this.$emit('input', this.agregatedProperties)
    }

    return createElement('div', {}, fields.map(field => {
      const config = {
        props: {
          properties: this.agregatedProperties,
          value: field.getValue({ properties: this.agregatedProperties }),
          field: field,
          readonly: this.readonly,
          disable: this.disable
        },
        on: {
          input: value => onInput(field, value)
        }
      }
      return createElement(FormWidget, config, [])
    }))
  }
}
