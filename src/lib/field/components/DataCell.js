export default {
  functional: true,
  render (createElement, context) {
    const value = context.props.field.tableValue(context.props.feature)

    if (typeof value === 'object') {
      const config = {
        ...context.data,
        props: {
          value: context.props.field.getValue(context.props.feature),
          field: context.props.field,
          feature: context.props.feature
        }
      }
      return createElement('q-td', {}, [
        createElement(value, config, context.children)
      ])
    } else {
      return createElement('q-td', {}, [
        value
      ])
    }
  }
}
