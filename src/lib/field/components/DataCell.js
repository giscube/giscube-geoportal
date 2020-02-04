export default {
  functional: true,
  render (createElement, context) {
    const data = context.props.data || { row: context.props.row }
    const value = context.props.field.tableValue(data)

    if (typeof value === 'object') {
      const config = {
        ...context.data,
        props: {
          ...context.props,
          value: context.props.field.getValue(data)
        }
      }
      return createElement('div', {}, [
        createElement(value, config, context.children)
      ])
    } else {
      return createElement('div', {}, [
        value
      ])
    }
  }
}
