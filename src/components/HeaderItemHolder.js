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
  render (createElement, { data, props, listeners }) {
    if (props.item.separator) {
      if (props.menu) {
        return null
      } else {
        return createElement('q-separator', {
          ...data,
          props: { vertical: true }
        })
      }
    } else if (props.item.spacer) {
      if (props.menu) {
        return createElement('q-separator', data)
      } else {
        return createElement('q-space', data)
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
        ...data,
        props: p,
        on
      })
    }
  }
}
