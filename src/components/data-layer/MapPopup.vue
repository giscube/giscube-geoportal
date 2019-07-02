<template>
  <div>
    <div class='popup' v-if="row">
      <popup-data
        :feature="row"
        :fields="fields"
        :render-contents="popupTemplate"
      ></popup-data>
      <div>
        <q-checkbox
          :value="row.status.selected"
          @input="select"
        />
        <q-btn flat
          v-show="editing && row.status.edited"
          icon="undo"
          :disable="saving"
          @click="undoRow(row)"
        />
        <q-btn flat
          v-show="editing"
          icon="edit"
          :disable="saving"
          @click="edit"
        />
        <q-btn flat
          v-show="editing"
          icon="delete"
          :disable="saving"
          @click="remove"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { QBtn, QCheckbox } from 'quasar'

import UndoMixin from './UndoMixin'
import PopupData from '../PopupData'

export default {
  mixins: [UndoMixin],
  components: {
    PopupData,
    QBtn,
    QCheckbox
  },
  computed: {
    fields () {
      return this.row.parent.info.fields
    },
    popupTemplate () {
      return this.row.parent.info.popupTemplate
    },
    editing () {
      return this.row.parent.editing
    },
    saving () {
      return this.row.parent.saving
    }
  },
  updated () {
    this.$nextTick(_ => this.$emit('updatePopupSize'))
  },
  methods: {
    select (value) {
      this.row.status.selected = value
    },
    edit () {
      this.row.uiEdit()
    },
    remove () {
      this.row.status.deleted = !this.row.status.deleted
    }
  }
}
</script>
