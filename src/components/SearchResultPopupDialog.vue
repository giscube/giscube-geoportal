<template>
  <q-dialog
    ref="dialog"
    no-route-dismiss
    @hide="$emit('hide')"
  >
    <q-card class="column q-pa-md">
      <q-card-section>
        <search-result-popup :feature="feature" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :label="$t('actions.close')" @click="onClose" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardActions, QCardSection, QDialog } from 'quasar'
import SearchResultPopup from './SearchResultPopup'

export default {
  props: ['feature'],
  components: {
    SearchResultPopup,
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QDialog
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
