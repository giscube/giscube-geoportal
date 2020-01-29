<template>
  <q-dialog
    ref="dialog"
    type="propt"
    :persistent="(!disable && !readonly) || localEdit"
    no-route-dismiss
    content-class="data-form"
    @hide="$emit('hide')"
  >
    <q-card class="data-form column no-wrap no-scroll">
      <q-card-section v-if="!navDisabled" class="row">
        <!-- Back -->
        <div>
          <q-btn
            :disable="rowIndex === 0"
            flat
            dense
            icon="mdi-chevron-double-left"
            @click="goto(0)"
          />
          <q-btn
            :disable="rowIndex === 0"
            flat
            dense
            icon="mdi-chevron-left"
            @click="goto(rowIndex - 1)"
          />
        </div>
        <!-- Current -->
        <span class="col q-ma-sm text-center">{{
          t('editing1', {
            index: rowIndex + 1, // start at 1
            total: table.rows.length
          })
        }}</span>
        <!-- Forward -->
        <div>
          <q-btn
            :disable="rowIndex >= table.rows.length - 1"
            flat
            dense
            icon="mdi-chevron-right"
            @click="goto(rowIndex + 1)"
          />
          <q-btn
            :disable="rowIndex >= table.rows.length - 1"
            flat
            dense
            icon="mdi-chevron-double-right"
            @click="goto(table.rows.length - 1)"
          />
        </div>
      </q-card-section>
      <q-card-section v-else-if="currentRows.length > 1" class="row">
        <span>{{
          t('editingN', {
            n: currentRows.length,
            total: table.rows.length
          })
        }}</span>
      </q-card-section>

      <q-card-section class="scroll">
        <data-form
          ref="form"
          :table="table"
          :rows="currentRows"
          :disable="disable"
          :readonly="formReadonly"
          @input="onInput"
        />
      </q-card-section>

      <q-card-section v-if="deleted" class="text-negative">
        <q-icon name="warning" class="q-mx-sm" size="1.5em" />
        <span>{{ allDeleted ? (deleted === 1 ? t('thisDeleted') : t('allDeleted')) : t('someDeleted') }}</span>
      </q-card-section>
      <q-card-actions v-if="!localEdit">
        <q-btn
          v-show="!disable && !readonly"
          :label="$t('actions.delete')"
          @click="onDelete"
        />
        <q-space />
        <q-btn
          v-show="readonly && rows.length === 1"
          :label="t('edit')"
          @click="startLocalEdit"
        />
        <q-btn
          :label="toCommit ? $t('actions.cancel') : $t('actions.close')"
          @click="onCancel"
        />
        <q-btn
          v-show="toCommit && !allDeleted"
          :label="$t('actions.apply')"
          @click="onCommit"
        />
      </q-card-actions>
      <q-card-actions v-else>
        <q-btn
          :label="$t('actions.delete')"
          @click="localDelete"
        />
        <q-space />
        <q-btn
          :label="hasResult ? $t('actions.discard') : $t('actions.cancel')"
          @click="localDiscard"
        />
        <q-btn
          v-if="hasResult"
          :label="$t('actions.save')"
          icon="save"
          @click="localSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardActions, QCardSection, QDialog, QIcon, QSpace } from 'quasar'
import Vue from 'vue'

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
      result: {},
      currentRows: [...this.rows],
      rowIndex: this.rows.length === 1 && this.table.rows.indexOf(this.rows[0]),
      localEdit: false
    }
  },
  computed: {
    row () {
      return this.currentRows.length === 1 ? this.currentRows[0] : null
    },
    formReadonly () {
      return this.readonly && !this.localEdit
    },
    hasResult () {
      return Object.keys(this.result).length > 0
    },
    deleted () {
      return this.currentRows.reduce((accumulated, row) => {
        return accumulated + (row.status.deleted ? 1 : 0)
      }, 0)
    },
    allDeleted () {
      return this.deleted === this.currentRows.length
    },
    isNew () {
      return !this.rows.some(row => !row.status.new)
    },
    toCommit () {
      return !this.disable && !this.readonly && (this.isNew || this.hasResult)
    },
    navDisabled () {
      return this.isNew || this.localEdit || this.currentRows.length !== 1 || this.rowIndex < 0
    }
  },
  methods: {
    onInput (value) {
      this.result = value
    },
    onDelete () {
      const deleted = !this.allDeleted
      this.currentRows.forEach(row => {
        if (row.status) {
          row.status.deleted = deleted
        }
      })
    },
    onCancel () {
      this.hide()
    },
    onCommit () {
      this.commit()
        .then(_ => {
          this.currentRows.forEach(row => row.edit(this.result))
          this.$emit('ok')
          this.hide()
        })
    },
    commit () {
      if (!this.hasResult && !this.isNew) {
        return Promise.reject()
      } else if (this.$refs.form.validate()) {
        return Promise.resolve()
      } else {
        return new Promise(resolve => {
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
            persistent: true
          })
            .then(api => {
              api.onOk(_ => resolve())
            })
        })
      }
    },
    goto (i) {
      this.commit()
        .then(_ => {
          this.row.edit(this.result)
        })
        .catch(_ => { /* do nothing */ })
        .then(_ => {
          Vue.set(this.currentRows, 'length', 0)
          this.currentRows.push(this.table.rows[i])
          this.rowIndex = i
          this.result = {}
        })
    },

    startLocalEdit () {
      this.localEdit = true
    },
    localSave () {
      this.saveRow()
      this.endLocalEdit()
    },
    saveRow () {
      this.row.edit(this.result)
      this.table.saveIndividual(this.row)
    },
    localDiscard () {
      this.endLocalEdit()
    },
    localDelete () {
      this.$store
        .dispatch('layout/createDialog', {
          message: this.t('qDeleteElement'),
          ok: {
            flat: true,
            label: this.$t('yes')
          },
          cancel: {
            flat: true,
            label: this.$t('no')
          },
          persistent: true
        })
        .then(api => api.onOk(_ => {
          this.hide()
          this.row.status.deleted = true
          this.saveRow()
        }))
    },
    endLocalEdit () {
      this.result = {}
      this.localEdit = false
      this.$refs.form.updateData()
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
