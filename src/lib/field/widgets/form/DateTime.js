import Base from './Default'

export default {
  mixins: [Base],
  computed: {
    valueObj () {
      return this.field.val2str(this.value)
    }
  }
}
