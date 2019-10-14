<template>
  <div class="custom-actions"
      @click.prevent.stop="">
    <q-btn
      flat
      dense
      size="sm"
      :icon="editing ? 'edit' : 'description'"
      :disable="true"
      @click="row.uiEdit()"
    />
    <q-btn
      v-show="edited && !isNew"
      flat
      dense
      size="sm"
      icon="undo"
      :disable="!edited || saving || isNew"
      @click="undoRow(row)"
    />
  </div>
</template>

<script>
import { QBtn } from 'quasar'
import UndoMixin from './UndoMixin'

export default {
  mixins: [UndoMixin],
  props: {
    row: {
      type: Object,
      required: true
    }
  },
  components: {
    QBtn
  },
  computed: {
    editing () {
      return this.row.parent.editing
    },
    deleted () {
      return this.row.status.deleted
    },
    edited () {
      return this.row.status.edited
    },
    isNew () {
      return this.row.status.new
    },
    saving () {
      return this.row.parent.saving
    }
  }
}
</script>
