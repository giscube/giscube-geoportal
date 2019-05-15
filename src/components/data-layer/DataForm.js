import MultiResult from '../../lib/MultiResult.js'
import FormWidget from '../../lib/field/components/FormWidget.js'

function aggregate (fields, features) {
  const aggregatedProperties = {}

  for (let field of fields) {
    let current
    for (let feature of features) {
      const value = field.clone({ feature, cleanup: true })

      if (current === undefined) {
        current = value
      } else if (MultiResult.is(current)) {
        current.values.add(value)
      } else if (current !== value) {
        current = new MultiResult([value, current])
      }
    }

    aggregatedProperties[field.name] = current
  }

  return aggregatedProperties
}

export default {
  props: ['properties', 'features', 'readonly', 'disable'],
  data () {
    return {
      aggregatedProperties: this.aggregateProperties(),
      callbacks: []
    }
  },
  computed: {
    fields () {
      return this.$store.getters['dataLayer/formFields']
    },
    renderableFields () {
      return this.$store.getters['dataLayer/renderableFormFields']
    }
  },
  watch: {
    features () {
      this.applyAggregateProperties()
    }
  },
  methods: {
    aggregateProperties () {
      let fields = this.$store.getters['dataLayer/formFields']
      if (!this.features) {
        fields = fields.filter(f => !f.requiresFeatures)
      }
      let properties = this.properties
      if (!properties) {
        properties = aggregate(fields, this.features)
      } else if (Array.isArray(properties)) {
        properties = aggregate(fields, [{ properties }])
      }
      return properties
    },
    applyAggregateProperties () {
      this.aggregatedProperties = this.aggregateProperties()
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
    },
    resolveCallbacks () {
      while (this.callbacks.length > 0) {
        const { field, value } = this.callbacks.shift()
        field.setValue({ properties: this.aggregatedProperties, value })
        this.fields.forEach(f => {
          f.onUpdate && f.onUpdate(
            field,
            value,
            this.aggregatedProperties,
            value => this.callbacks.push({ field: f, value })
          )
        })
      }
    },
    onInput (field, value) {
      this.callbacks.push({ field, value })
      this.resolveCallbacks()
      this.$emit('input', this.aggregatedProperties)
    }
  },
  render (createElement) {
    if (!this.fields) {
      return
    }

    return createElement('div', {}, this.renderableFields.map(field => {
      const config = {
        props: {
          properties: this.aggregatedProperties,
          value: field.getValue({ properties: this.aggregatedProperties }),
          field: field,
          readonly: this.readonly,
          disable: this.disable
        },
        on: {
          input: value => this.onInput(field, value)
        }
      }
      return createElement(FormWidget, config, [])
    }))
  }
}
