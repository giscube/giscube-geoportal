import { QSeparator, QSpace } from 'quasar'

import HeaderItem from './HeaderItem.vue'
import HeaderDropdown from './HeaderDropdown.vue'

export default {
  functional: true,
  props: {
    item: {
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
        return createElement(QSeparator, {
          ...data,
          props: { vertical: true }
        })
      }
    } else if (props.item.spacer) {
      if (props.menu) {
        return createElement(QSeparator, data)
      } else {
        return createElement(QSpace, data)
      }
    } else if (props.item.name) {
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
    } else {
      const p = {
        icon: props.item.icon,
        label: props.item.label,
        items: props.item.items,
        menu: props.menu
      }

      // forward events
      const on = {
        'sidebar-visibility-changed': value => listeners['sidebar-visibility-changed'](value),
        event: value => listeners.event(value)
      }

      const component = HeaderDropdown
      return createElement(component, {
        ...data,
        props: p,
        on
      })
    }
  }
}
