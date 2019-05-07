<template>
  <q-dialog
    ref="dialog"
    maximized
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
  props: ['src'],
  components: {
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
