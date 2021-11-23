<template>
  <q-dialog
    ref="dialog"
    no-route-dismiss
    @hide="$emit('hide')"
  >
    <q-card class="row q-pa-md justify-end">
      <q-btn icon="close" size="sm" flat dense @click="onClose"/>
      <q-card-section>
        <popup-base :row="row" @update-popup-size="$emit('update-popup-size')" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardSection, QDialog } from 'quasar'
import PopupBase from './PopupBase'

export default {
  props: ['row', 'dialogHandlers'],
  components: {
    PopupBase,
    QBtn,
    QCard,
    QCardSection,
    QDialog
  },
  mounted () {
    this.dialogHandlers.close = this.close.bind(this)
  },
  methods: {
    show () {
      this.$refs.dialog.show()
    },
    hide () {
      this.$refs.dialog.hide()
    },
    async close () {
      this.hide()
      return true
    },
    onClose () {
      this.hide()
    }
  }
}
</script>
