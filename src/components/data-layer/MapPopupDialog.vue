<template>
  <q-dialog
    ref="dialog"
    no-route-dismiss
    @hide="$emit('hide')"
  >
    <q-card class="column q-pa-md">
      <q-card-section>
        <popup-base :row="row" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :label="$t('actions.close')" @click="onClose" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardActions, QCardSection, QDialog } from 'quasar'
import PopupBase from './PopupBase'

export default {
  props: ['row', 'dialogHandlers'],
  components: {
    PopupBase,
    QBtn,
    QCard,
    QCardActions,
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
