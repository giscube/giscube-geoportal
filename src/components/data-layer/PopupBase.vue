<template>
  <div class='popup' v-if="row">
    <popup-data
      :feature="row"
      :fields="fields"
      :render-contents="popupTemplate"
      table-fallback
    ></popup-data>
    <div>
      <q-checkbox
        :value="row.status.selected"
        @input="select"
      />
      <q-btn flat dense
        :icon="editing ? 'edit' : 'description'"
        @click="edit"
      />
      <q-btn flat dense
        v-show="editing && row.status.edited && !row.status.new"
        icon="undo"
        @click="undoRow(row)"
      />
      <q-btn flat dense
        v-show="editing"
        icon="delete"
        @click="remove"
      />
    </div>
  </div>
</template>

<script>
import { QBtn, QCheckbox } from 'quasar'

import UndoMixin from './UndoMixin'
import PopupData from '../PopupData'

export default {
  props: ['row'],
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
    }
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

<style>
.popup {
  text-align: left;
}
</style>
