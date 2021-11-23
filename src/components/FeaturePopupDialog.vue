<template>
  <q-dialog
    ref="dialog"
    no-route-dismiss
    @hide="$emit('hide')"
  >
    <q-card class="row q-pa-md justify-end">
      <q-btn icon="close" size="sm" flat dense @click="onClose"/>
      <q-card-section>
        <feature-popup
          :feature="feature"
          :title="title"
          :renderContents="renderContents"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardSection, QDialog } from 'quasar'
import FeaturePopup from './FeaturePopup'

export default {
  props: ['feature', 'title', 'renderContents'],
  components: {
    FeaturePopup,
    QBtn,
    QCard,
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
