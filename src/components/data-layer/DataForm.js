import MultiResult from '../../lib/MultiResult.js'
import FormWidget from '../../lib/field/components/FormWidget.js'

function aggregate (fields, rows) {
  const aggregatedProperties = {}

  for (let field of fields) {
    if (!field.virtual) {
      let current
      for (let row of rows) {
        const value = field.clone({ row, cleanup: true })

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
  }

  return aggregatedProperties
}

export default {
  props: ['table', 'rows', 'readonly', 'disable'],
  data () {
    const aggregatedProperties = this.aggregateProperties()
    return {
      aggregatedProperties,
      origProps: { ...aggregatedProperties },
      callbacks: []
    }
  },
  watch: {
    rows () {
      this.callbacks = []
      this.aggregatedProperties = this.aggregateProperties()
    }
  },
  methods: {
    aggregateProperties () {
      let fields = this.table.info.logicFormFields
      if (!this.rows) {
        fields = fields.filter(f => !f.requiresFeatures)
      }
      return aggregate(fields, this.rows)
    },
    validate () {
      return this.$children.reduce(
        (total, children) => {
          const currentValidation = children.validate === undefined || children.readonly || children.disabled || children.validate() === true
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
        this.table.info.logicFormFields.forEach(f => {
          !f.virtual && f.onUpdate && f.onUpdate(
            field,
            value,
            this.aggregatedProperties,
            value => this.callbacks.push({ field: f, value })
          )
        })
      }
    },
    onInput (field, value) {
      if (field.getValue({ properties: this.aggregatedProperties }) === value) {
        return
      }
      this.callbacks.push({ field, value })
      this.resolveCallbacks()

      const result = {}
      this.table.info.logicFormFields.forEach(field => {
        if (!field.equals({ properties: this.aggregatedProperties }, { properties: this.origProps })) {
          field.cloneSetValue({ properties: this.aggregatedProperties }, { properties: result })
        }
      })
      this.$emit('input', result)
    }
  },
  render (createElement) {
    return createElement('div', {}, this.table.info.formFields.map(field => {
      const properties = this.aggregatedProperties

      const config = {
        props: {
          value: field.getValue({ properties }),
          field: field,
          readonly: this.readonly,
          disable: this.disable,
          table: this.table
        },
        on: {
          input: value => this.onInput(field, value)
        }
      }
      return createElement(FormWidget, config, [])
    }))
  }
}
