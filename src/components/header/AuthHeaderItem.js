import HeaderItem from './HeaderItem'

export default {
  mixins: [HeaderItem],
  computed: {
    username () {
      return this.$store.state.auth.username
    },
    label () {
      return this.username || this.$t('tools.' + this.name + '.headerName')
    },
    style () {
      return {
        'text-transform': this.username ? 'none' : undefined
      }
    }
  }
}
