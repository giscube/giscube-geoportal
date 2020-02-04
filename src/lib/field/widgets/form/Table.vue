<template>
  <q-btn
    class="full-width q-mb-sm"
    icon-right="keyboard_arrow_right"
    :disable="isVoid || isMulti"
    :label="label_"
    @click="openTableDialog"
  />
</template>

<script>
import { QBtn } from 'quasar'

import MultiResult from 'src/lib/MultiResult'
import Table from 'src/lib/table'
import { isVoid } from 'src/lib/utils'
import TableDialog from 'components/data-layer/TableDialog'

export default {
  props: ['value', 'field', 'table', 'readonly', 'disable', 'label'],
  components: {
    QBtn
  },
  computed: {
    isVoid () {
      return isVoid(this.value) || isVoid(this.value._fk)
    },
    isMulti () {
      return MultiResult.is(this.value)
    },
    label_ () {
      let label = this.label || this.$filter('capitalize')(this.field.label)
      if (!this.isVoid && !this.isMulti && !isVoid(this.value.count)) {
        label += ` (${this.value.count})`
      }

      return label
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
        [this.field.layerFk]: this.value._fk
      }

      const table = new Table(source, layer, root, constFields)
      this.$store.dispatch('layout/createDialog', {
        component: TableDialog,
        root,
        table
      }).then(api => {
        api.onDismiss(() => {
          this.$emit('input', { count: table.remote.pagination.rowsNumber })
        })
      })
    }
  }
}
</script>
