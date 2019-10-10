<template>
  <q-btn
    class="full-width q-mb-sm"
    icon-right="keyboard_arrow_right"
    :disabled="isVoid || isMulti"
    :label="field.label | capitalize"
    @click="openTableDialog"
  />
</template>

<script>
import { QBtn } from 'quasar'

import MultiResult from 'src/lib/MultiResult'
import Table from 'src/lib/table'
import TableDialog from 'components/data-layer/TableDialog'

export default {
  props: ['value', 'field', 'table', 'readonly', 'disable'],
  components: {
    QBtn
  },
  computed: {
    isVoid () {
      return this.value === void 0 || this.value === null
    },
    isMulti () {
      return MultiResult.is(this.value)
    }
  },
  methods: {
    openTableDialog () {
      const source = this.table.remote.source
      const layer = {
        name: this.field.layer
      }
      const root = this.$root
      const constFields = {
        [this.field.layerFk]: this.value
      }

      this.$store.dispatch('layout/createDialog', {
        component: TableDialog,
        root,
        table: new Table(source, layer, root, constFields),
        readonly: this.readonly,
        disable: this.disable
      })
    }
  }
}
</script>
