import { QTd } from 'quasar'

export default {
  functional: true,
  render (createElement, context) {
    const value = context.props.field.tableValue({ row: context.props.row })

    if (typeof value === 'object') {
      const config = {
        ...context.data,
        props: {
          value: context.props.field.getValue({ row: context.props.row }),
          field: context.props.field,
          row: context.props.row,
          table: context.props.table
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
