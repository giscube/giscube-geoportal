import { QBtn, QMenu } from 'quasar'

export default {
  functional: true,
  render (h, ctx) {
    const { value, field } = ctx.props
    return h(
      QBtn,
      {
        props: {
          flat: true,
          dense: true,
          size: 'sm',
          icon: value ? 'mdi-filter' : 'mdi-filter-outline'
        },
        domProps: {
          class: 'q-mx-xs'
        },
        on: {
          click (event) {
            event.stopPropagation()
          }
        }
      },
      [
        h(
          QMenu,
          [
            h(
              field.filterComponent(),
              ctx.data,
              ctx.children
            )
          ]
        )
      ]
    )
  }
}
