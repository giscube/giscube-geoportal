<template>
  <div>
    <q-field
      :readonly="readonly"
      :disable="disable"
      :label="field.label"
      :stack-label="!!v"
      :clearable="field.null"
      :hint="hint"
      @input="onClear"
      @focus.native="$refs.dialog.show()"
      @click.native="$refs.dialog.show()"
    >
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">{{ v }}</div>
      </template>
    </q-field>

    <q-dialog
      ref="dialog"
      maximized
    >
      <q-card>
        <q-card-section style="display: flex;">
          <q-markup-table style="margin-left:auto; margin-right: auto;">
            <thead>
              <tr>
                <th :colspan="field.headers.length">
                  <div class="full-width row">
                    <div class="text-h6">{{ field.label }}</div>
                    <q-space />
                    <q-btn
                      label="Close"
                      flat
                      @click="$refs.dialog.hide()"
                    />
                  </div>
                </th>
              </tr>
              <tr>
                <th
                v-for="header in field.headers"
                :key="'header-' + header"
                >
                {{ header }}
              </th>
            </tr>
            </thead>
            <tbody>
              <tr
                v-for="values in field.valuesList"
                :key="'row-' + values[0]"
                @click="select(values)"
              >
                <td
                  v-for="(value, i) in values"
                  :key="'row-' + values[0] + '-' + i"
                >
                  {{ value }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import MultiResult from '../../../MultiResult.js'

export default {
  props: ['value', 'field', 'readonly', 'disable'],
  computed: {
    v () {
      if (MultiResult.is(this.value)) {
        return null
      }
      const result = this.value && this.field.valuesDict[this.value]
      return result ? result[1] : this.value
    },
    hint () {
      return MultiResult.is(this.value) && Array.from(this.value.values).map(value => {
        const h = this.field.valuesDict[value]
        return h && h[1]
      }).join(', ')
    }
  },
  methods: {
    select (values) {
      this.$emit('input', values[0])

      this.$nextTick(_ => this.$refs.dialog.hide())
    },
    onClear (v = null) {
      if (v === null) {
        this.$emit('input', null)
      }
    }
  }
}
</script>
