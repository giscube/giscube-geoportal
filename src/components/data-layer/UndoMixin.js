export default {
  methods: {
    undoRow (row) {
      this.$store.dispatch('layout/createDialog', {
        message: this.$t('tools.data.undoConfirm'),
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
          row.revert()
        }))
    }
  }
}
