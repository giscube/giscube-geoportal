<template>
  <div class="custom-actions"
      @click.prevent.stop="">
    <q-btn
      flat
      dense
      size="sm"
      icon="undo"
      :disabled="!edited || saving || isNew"
      @click="revertItem()"
    />
    <q-btn
      flat
      dense
      size="sm"
      icon="edit"
      :disabled="!editing || saving"
      @click="row.uiEdit()"
    />

  </div>
</template>

<script>
import { QBtn } from 'quasar'

export default {
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
  },
  methods: {
    revertItem () {
      this.$q.dialog({
        message: this.$t('tools.data.undoConfirm'),
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
        this.row.revert()
      })
    }
  }
}
</script>
