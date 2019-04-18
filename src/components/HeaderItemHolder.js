// import Vue from 'vue'
import HeaderItem from './HeaderItem.vue'

export default {
  functional: true,
  props: {
    item: {
      type: Object,
      required: true
    },
    menu: {
      type: Boolean,
      default: false
    }
  },
  render (createElement, { props, listeners }) {
    if (props.item.separator) {
      if (props.menu) {
        return null
      } else {
        const p = { vertical: true }
        return createElement('q-separator', { props: p })
      }
    } else if (props.item.spacer) {
      if (props.menu) {
        return createElement('q-separator')
      } else {
        return createElement('q-space')
      }
    } else {
      const p = {
        name: props.item.name,
        tool: props.item.tool,
        menu: props.menu
      }

      // forward events
      const on = {
        'sidebar-visibility-changed': value => listeners['sidebar-visibility-changed'](value),
        event: value => listeners.event(value)
      }

      const component = props.item.tool.headerComponent || HeaderItem
      return createElement(component, {
        props: p,
        on
      })
    }
  }
}
