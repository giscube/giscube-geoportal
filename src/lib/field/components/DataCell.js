import { QTd } from 'quasar'

export default {
  functional: true,
  render (createElement, context) {
    const value = context.props.field.tableValue({ feature: context.props.feature })

    if (typeof value === 'object') {
      const config = {
        ...context.data,
        props: {
          value: context.props.field.getValue({ feature: context.props.feature }),
          field: context.props.field,
          feature: context.props.feature
        }
      }
      return createElement(QTd, {}, [
        createElement(value, config, context.children)
      ])
    } else {
      return createElement(QTd, {}, [
        value
      ])
    }
  }
}
