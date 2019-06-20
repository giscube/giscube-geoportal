<template>
  <q-dialog
    ref="dialog"
    maximized
    no-route-dismiss
    @hide="onDialogHide"
  >
    <q-card class="column q-pa-md" >
      <q-card-section class="col" >
        <img :src="src" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :label="$t('actions.close')" @click="onClose" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardActions, QCardSection, QDialog } from 'quasar'
export default {
  props: ['src', 'dialogHandlers'],
  components: {
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
    onDialogHide () {
      this.$emit('hide')
    },
    onClose () {
      this.hide()
    }
  }
}
</script>

<style scoped>
img {
  display: block;
  margin: auto;
  max-width: 100%;
  max-height: 100%;
  /* auto-grow */
  width: unset;
  height: unset;
}
</style>
