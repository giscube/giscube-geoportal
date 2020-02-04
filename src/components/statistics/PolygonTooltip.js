import { mapState } from 'vuex'
import { isVoid } from 'src/lib/utils'

export default {
  props: {
    layer: {
      type: Object,
      required: true
    },
    attr: {
      type: String,
      default: 'count'
    }
  },
  computed: mapState('statistics', ['result', 'colorMap']),
  render: function (h) {
    let value = this.result && this.result.get(this.layer)
    if (isVoid(value)) {
      value = ''
    } else {
      value = value[this.attr].toString()
    }
    const color = this.colorMap.get(this.layer) || this.colorMap.get('default')
    return h('span', { class: ['invert-text'], style: { color } }, value)
  }
}
