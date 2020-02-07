<template>
  <q-dialog
    ref="dialog"
    type="propt"
    persistent
    no-route-dismiss
    content-class="data-form"
    @hide="$emit('hide')"
  >
    <q-card class="data-form column no-wrap no-scroll">
      <q-card-section class="row">
        <!-- Back -->
        <div>
          <q-btn
            :disable="index <= 0"
            flat
            dense
            icon="mdi-chevron-double-left"
            @click="goto(0)"
          />
          <q-btn
            :disable="index <= 0"
            flat
            dense
            icon="mdi-chevron-left"
            @click="goto(index - 1)"
          />
        </div>
        <!-- Current -->
        <span class="col q-ma-sm text-center">{{
          t('editing1', {
            index: index + 1, // start at 1
            total: toFix.length
          })
        }}</span>
        <!-- Forward -->
        <div>
          <q-btn
            :disable="index >= toFix.length - 1"
            flat
            dense
            icon="mdi-chevron-right"
            @click="goto(index + 1)"
          />
          <q-btn
            :disable="index >= toFix.length - 1"
            flat
            dense
            icon="mdi-chevron-double-right"
            @click="goto(toFix.length - 1)"
          />
        </div>
      </q-card-section>

      <q-card-section class="scroll">
        <data-form
          ref="form"
          :table="table"
          :rows="[row]"
          @input="row.properties = $event"
        />
      </q-card-section>

      <q-card-actions>
        <q-space />
        <q-btn
          :disabled="index < toFix.length - 1"
          :label="$t('actions.save')"
          icon="save"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardActions, QCardSection, QDialog, QSpace } from 'quasar'

import DataForm from './DataForm'
import TranslationMixin from './TranslationMixin'

export default {
  mixins: [TranslationMixin],
  props: {
    table: null,
    toFix: {
      type: Array,
      required: true
    }
  },
  components: {
    DataForm,
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QDialog,
    QSpace
  },
  data () {
    return {
      index: 0
    }
  },
  computed: {
    current () {
      return this.toFix[this.index]
    },
    row () {
      return this.current.row
    }
  },
  methods: {
    goto (n) {
      this.index = n
    },
    save () {
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
