<template>
  <div class="custom-actions"
      @click.prevent.stop="">
    <q-btn
      flat
      dense
      size="sm"
      icon="undo"
      :disabled="!edited"
      @click="revertItem()"
    />
    <q-btn
      flat
      dense
      size="sm"
      icon="edit"
      :disabled="deleted || !editing"
      @click="editItem(rowData, rowIndex)"
    />
    <q-btn
      flat
      dense
      size="sm"
      icon="delete"
      :disabled="!editing"
      @click="deleteItem(rowData, rowIndex)"
    />

  </div>
</template>

<script>
export default {
  props: {
    rowData: {
      type: Object,
      required: true
    },
    rowIndex: null
  },
  computed: {
    originals () {
      return this.$store.state.dataLayer.editStatus.originals
    },
    editing () {
      return this.$store.state.dataLayer.editStatus.editing
    },
    deleted () {
      return this.rowData.status && this.rowData.status.deleted
    },
    edited () {
      return this.editing && this.rowData.getPk && this.rowData.getPk() in this.originals
    }
  },
  methods: {
    deleteItem (data, index) {
      data.status.deleted = !data.status.deleted
    },
    formClosed () {
      this.formVisible = false
    },
    editItem (data, index) {
      this.$emit('edit', this.rowData)
    },
    revertItem () {
      this.$store.commit('dataLayer/revertFeature', this.rowData)
    }
  }
}
</script>
