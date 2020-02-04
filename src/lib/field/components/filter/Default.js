import { QCard, QCardSection } from 'quasar'

export default {
  functional: true,
  render (h, context) {
    return h(QCard, {}, [
      h(QCardSection, {}, [
        h(
          context.props.field.filterWidget(),
          context.data,
          context.children
        )
      ])
    ])
  }
}
