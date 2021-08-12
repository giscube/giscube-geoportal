<template>
  <q-select
    :readonly="readonly"
    :disable="disable"
    :label="label_"
    :clearable="field.null"
    :rules="rules"
    lazy-rules
    :options="options"
    :value="v"
    :display-value="valuesDict[v]"
    :hint="hint"
    :use-input="true"
    @input="newInput"
    @new-value="createValue"
  />
</template>

<script>
//

import { QSelect } from 'quasar'

import MultiResult from '../../../MultiResult.js'
import MultiValueMixin from '../mixins/MultiValueMixin'
import ValidateMixin from '../mixins/ValidateMixin'

export default {
  props: ['value', 'field', 'readonly', 'disable', 'label'],
  mixins: [MultiValueMixin, ValidateMixin],
  components: {
    QSelect
  },
  computed: {
    canAddNewValues () {
      return this.field.allowAddNew
    },
    label_ () {
      return this.label || this.$filter('capitalize')(this.field.label)
    },
    newValueMode () {
      console.log('WP', this.field.allowAddNew && 'add-unique')
      return this.field.allowAddNew && 'add-unique'
    },
    options () {
      console.log('options', this.field.valuesList)
      return this.field.valuesList
    },
    valuesDict () {
      return this.field.valuesDict
    },
    hint () {
      if (!MultiResult.is(this.valueObj)) {
        return null
      }

      const cleanValues = this.options.filter(option => this.valueObj.values.has(option.value)).map(option => option.value)

      if (this.valueObj.values.has(null)) {
        cleanValues.push(`<${this.$t('values.empty')}>`)
      }

      return `Multiple values: ${cleanValues.join(', ')}`
    }
  },
  methods: {
    createValue (val, done) {
      // specific logic to eventually call done(...) -- or not
      console.log('WOOOOOP', val)
      this.field.valuesDict[val] = val
      this.field.valuesList.push({ value: val, label: val })
      done(val, 'add-unique')

      // done callback has two optional parameters:
      //  - the value to be added
      //  - the behavior (same values of new-value-mode prop,
      //    and when it is specified it overrides that prop –
      //    if it is used); default behavior (if not using
      //    new-value-mode) is to add the value even if it would
      //    be a duplicate
    },
    newInput ($event) {
      console.log('newInput', $event)
      this.$emit('input', $event ? $event.value : $event)
    }
  }
}
</script>
