export default {
  methods: {
    t (key, args) {
      return this.$t('tools.data.' + key, args)
    }
  }
}
