<template>
  <q-dialog
    ref="dialog"
    @hide="$emit('hide')"
  >
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ t('defaultProperties') }}</div>
      </q-card-section>
      <q-card-section class="column q-pa-md">
        <data-form
          :table="table"
          :rows="[row]"
          :disable="disable"
          :readonly="readonly"
          @input="row.edit($event)"
          style="width: 50ch; max-width: 100%"
          class="q-mb-md"
        />
        <q-checkbox
          v-show="geomBased"
          :value="editMultiple"
          @input="$emit('update:editMultiple', $event)"
          :label="t('multipleNew')"
        />
        <q-checkbox
          :value="dialogForNew"
          @input="$emit('update:dialogForNew', $event)"
          :label="geomBased ? t('dialogNewGeom') : t('dialogNew')"
        />
        <q-checkbox
          :value="selectNews"
          @input="$emit('update:selectNews', $event)"
          :label="t('selectNews')"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="$t('actions.accept')" color="primary" @click="hide()" />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>
<script>
import { QBtn, QCard, QCardActions, QCardSection, QCheckbox, QDialog } from 'quasar'
import DataForm from './DataForm'
import TranslationMixin from './TranslationMixin'

export default {
  mixins: [TranslationMixin],
  props: {
    table: null,
    allowGeom: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      required: true
    },
    disable: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    editMultiple: Boolean,
    dialogForNew: Boolean,
    selectNews: Boolean
  },
  components: {
    DataForm,
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QCheckbox,
    QDialog
  },
  computed: {
    geomBased () {
      return this.allowGeom && this.table.hasGeom && !this.table.readonlyGeom
    }
  },
  methods: {
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
