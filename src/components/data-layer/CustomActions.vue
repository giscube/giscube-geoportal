<template>
  <div class="custom-actions"
      @click.prevent.stop="">
    <q-btn
      flat
      dense
      size="sm"
      icon="undo"
      :disabled="!edited || saving"
      @click="revertItem()"
    />
    <q-btn
      flat
      dense
      size="sm"
      icon="edit"
      :disabled="deleted || !editing || saving"
      @click="editItem(rowData, rowIndex)"
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
    },
    saving () {
      return this.$store.state.dataLayer.editStatus.saving
    }
  },
  methods: {
    formClosed () {
      this.formVisible = false
    },
    editItem (data, index) {
      this.$emit('edit', this.rowData)
    },
    revertItem () {
      this.$q.dialog({
        message: 'Are you sure you want to undo the changes in this element?',
        ok: {
          flat: true,
          label: this.$t('yes')
        },
        cancel: {
          flat: true,
          label: this.$t('no')
        },
        persistent: true
      }).onOk(_ => {
        this.$store.commit('dataLayer/revertFeature', this.rowData)
      })
    }
  }
}
</script>
