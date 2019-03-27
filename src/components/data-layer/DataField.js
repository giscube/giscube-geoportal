import { MultiResult } from '../../lib/MultiResult.js'
export { MultiResult }

function baseWidget () {
  const v = this.value[this.fieldInfo.name]
  return {
    props: {
      value: (MultiResult.is(v) || v === null) ? undefined : v
    },
    on: {
      input: value => {
        this.value[this.fieldInfo.name] = value
        this.$emit('input', this.value)
      }
    },
    childs: [],
    validate: () => true,
    resetValidation: () => {}
  }
}

function input () {
  const widget = baseWidget.call(this)
  widget.el = 'q-input'
  widget.props.readonly = this.readonly
  widget.props.label = this.label
  widget.props.clearable = this.fieldInfo.null
  widget.props.rules = [
    val => (val !== null && val !== undefined && val !== '') || this.t('requiredField')
  ]

  widget.validate = () => {
    this.vWidget.validate()
    return this.vWidget.hasError
  }
  widget.resetValidation = () => {
    this.vWidget.resetValidation()
  }

  // Multiple values at hint prop
  const v = this.value[this.fieldInfo.name]
  if (MultiResult.is(v)) {
    const cleanValues = [...v.values]
      .sort((a, b) => {
        if (a === null) {
          return 1
        } else if (b === null) {
          return -1
        } else if (typeof a === 'number' && typeof b === 'number') {
          return a - b
        } else {
          return a.toString().localeCompare(b.toString())
        }
      })
      .map(value => (value || `<${this.$t('empty value')}>`))

    widget.props.hint = `Multiple values: ${cleanValues.join(', ')}`
  } else {
    widget.props.hint = ''
  }

  return widget
}

const WIDGETS = {
  default () {
    const widget = input.call(this)
    return widget
  },
  readonly () {
    return {
      el: 'p',
      childs: [ this.value[this.fieldInfo.name] ],
      validate: () => true,
      resetValidation: () => {}
    }
  },
  number () {
    const widget = input.call(this)
    widget.props.type = 'number'

    // Max length
    if (this.fieldInfo.size === undefined || this.fieldInfo.size === null) {
      widget.props.max = Infinity
    } else {
      const s = this.fieldInfo.size
      const d = this.fieldInfo.decimals || 0
      widget.props.max = Math.pow(10, s - d) - Math.pow(10, -d)
    }

    return widget
  },
  boolean () {
    const widget = input.call(this)
    widget.el = 'q-select'

    widget.props.options = [
      { label: this.$t('no'), value: false },
      { label: this.$t('yes'), value: true }
    ]

    const value = widget.props.value
    if (value === true) {
      widget.props.value = { label: this.$t('yes'), value: true }
    } else if (value === false) {
      widget.props.value = { label: this.$t('no'), value: false }
    }

    widget.on.input = value => {
      this.value[this.fieldInfo.name] = value ? value.value : value
      this.$emit('input', this.value)
    }

    return widget
  },
  choices () {
    const widget = input.call(this)
    widget.el = 'q-select'

    const values = this.fieldInfo.valuesDict
    widget.props.options = Object.keys(values).map(key => ({ label: values[key], value: key }))

    widget.props['display-value'] = values[widget.props.value]

    widget.on.input = value => {
      this.value[this.fieldInfo.name] = value ? value.value : value
      this.$emit('input', this.value)
    }

    if (this.isMuliple) {
      const v = values[this.value[this.fieldInfo.name]]
      const cleanValues = []
      v.values.forEach(value => {
        cleanValues.push(value || `<${this.$t('empty value')}>`)
      })
      widget.props.hint = `Multiple values: ${cleanValues.join(', ')}`
    }

    return widget
  }
}

export default {
  props: {
    value: {
      type: Object,
      required: true
    },
    disable: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    label: {
      type: String
    },
    fieldInfo: {
      type: Object,
      required: true
    }
  },
  computed: {
    widget () {
      let widget

      if (this.fieldInfo.valuesDict) {
        widget = WIDGETS.choices
      } else {
        widget = WIDGETS[this.fieldInfo.widget]
      }
      if (!widget) {
        widget = WIDGETS.default
      }

      if (this.readonly) {
        if (widget.readonly) {
          widget = widget.readonly
        }
      } else {
        if (widget.editable) {
          widget = widget.editable
        }
      }

      return widget.call(this)
    },
    vWidget () {
      return this.$children[0]
    }
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.data.' + key, ...args)
    },
    validate () {
      return this.widget && this.widget.validate()
    },
    resetValidation () {
      return this.widget && this.widget.resetValidation()
    }
  },
  render (createElement) {
    return createElement(this.widget.el, { props: this.widget.props, on: this.widget.on }, this.widget.childs)
  }
}
