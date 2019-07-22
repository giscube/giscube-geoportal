<template>
  <q-dialog
    ref="dialog"
    no-route-dismiss
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin">
      <q-card-section v-if="title">
        <div class="text-h6">{{ title }}</div>
      </q-card-section>
      <q-card-section>
        <div>{{ msg }}</div>
      </q-card-section>
      <q-card-actions>
        <q-btn flat :label="$t(dontAskCancel ? 'actions.dontAsk' : 'actions.cancel')" @click="onCancel" />
        <q-space />
        <q-btn flat :label="$t('no')" @click="onNo" />
        <q-btn flat :label="$t('yes')" @click="onYes" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardActions, QCardSection, QDialog, QSpace } from 'quasar'

export default {
  props: ['dialogHandlers', 'title', 'msg', 'dontAskCancel'],
  components: {
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QDialog,
    QSpace
  },
  mounted () {
    this.dialogHandlers.close = this.hide.bind(this)
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
    onYes () {
      this.$emit('ok', true)
      this.hide()
    },
    onNo () {
      this.$emit('ok', false)
      this.hide()
    },
    onCancel () {
      this.hide()
    }
  }
}
</script>
