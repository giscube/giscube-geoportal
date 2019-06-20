<template>
  <q-dialog
    ref="dialog"
    type="propt"
    persistent
    no-route-dismiss
    content-class="data-form"
  >
    <q-card class="data-form column no-wrap">
      <q-card-section class="col scroll">
        <data-form
          ref="form"
          :table="table"
          :rows="rows"
          :disable="disable"
          :readonly="readonly"
          @input="onInput"
        />
      </q-card-section>

      <q-card-section v-if="deleted" class="text-negative">
        <q-icon name="warning" class="q-mx-sm" size="1.5em" />
        <span>{{ allDeleted ? (deleted === 1 ? t('thisDeleted') : t('allDeleted')) : t('someDeleted') }}</span>
      </q-card-section>
      <q-card-actions>
        <q-btn
          v-show="!disable && !readonly"
          :label="$t('actions.delete')"
          @click="onDelete"
        />
        <q-space />
        <q-btn
          :label="!disable && !readonly && hasResult ? $t('actions.cancel') : $t('actions.accept')"
          @click="onCancel"
        />
        <q-btn
          v-show="!disable && !readonly && hasResult && !allDeleted"
          :label="$t('actions.apply')"
          @click="onCommit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardActions, QCardSection, QDialog, QIcon, QSpace } from 'quasar'
import DataForm from './DataForm'
import TranslationMixin from './TranslationMixin'

export default {
  mixins: [TranslationMixin],
  props: {
    table: null,
    rows: {
      type: Array,
      required: true
    },
    disable: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  components: {
    DataForm,
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QDialog,
    QIcon,
    QSpace
  },
  data () {
    return {
      result: {}
    }
  },
  computed: {
    hasResult () {
      return Object.keys(this.result).length > 0
    },
    deleted () {
      return this.rows.reduce((accumulated, row) => {
        return accumulated + (row.status.deleted ? 1 : 0)
      }, 0)
    },
    allDeleted () {
      return this.deleted === this.rows.length
    }
  },
  watch: {
    rows () {
      this.result = {}
    }
  },
  methods: {
    onInput (value) {
      this.result = value
    },
    onDelete () {
      const deleted = !this.allDeleted
      this.rows.forEach(row => {
        if (row.status) {
          row.status.deleted = deleted
        }
      })
    },
    onCancel () {
      this.$emit('hide')
    },
    onCommit () {
      if (this.$refs.form.validate()) {
        this.doCommit()
      } else {
        this.$store.dispatch('layout/createDialog', {
          message: this.t('qInvalidCommit'),
          ok: {
            flat: true,
            label: this.$t('yes')
          },
          cancel: {
            flat: true,
            label: this.$t('no')
          },
          persistent: true,
          noRouteDismiss: true
        })
          .then(api => api.onOk(_ => {
            this.doCommit()
          }))
      }
    },
    doCommit () {
      this.rows.forEach(row => row.edit(this.result))
      this.$emit('ok')
      this.hide()
    },

    // Required by Quasar's dialog API
    show () {
      this.$refs.dialog.show()
    },
    hide () {
      this.$refs.dialog.hide()
    }
  }
}
</script>

<style lang="scss">
.q-dialog.data-form {
  .q-card.data-form {
    width: 70ch;
    max-width: 100%;
    max-height: 100%;
  }
  @media (max-width: 767px) {
    .q-dialog__inner--minimized {
      padding: 10px;
      align-items: start;
    }
  }
}
</style>
