export default {
  functional: true,
  props: ['table', 'value', 'field', 'readonly', 'disable'],
  render (createElement, context) {
    const formValue = context.props.field.formWidget()

    // pass all the data except for props
    // this includes listeners
    const config = {
      ...context.data,
      props: {
        value: context.props.value,
        field: context.props.field,
        readonly: context.props.readonly || context.props.field.readonly,
        disable: context.props.disable,
        table: context.props.table
      }
    }

    return createElement(formValue, config, context.children)
  }
}
