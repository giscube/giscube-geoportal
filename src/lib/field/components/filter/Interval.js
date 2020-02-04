import { QCard, QCardSection } from 'quasar'
import { isVoid } from 'src/lib/utils'

export class Interval {
  constructor ({ min, max } = {}) {
    this.min = min
    this.max = max
  }

  asObject () {
    return {
      min: this.min,
      max: this.max
    }
  }

  join (obj) {
    const value = { ...this.asObject(), ...obj }
    if (!isVoid(value.min) || !isVoid(value.max)) {
      return new Interval(value)
    }
  }
}

export default {
  functional: true,
  render (h, { props, parent, data }) {
    const { field, value = new Interval() } = props
    const Widget = field.filterWidget()
    const inputEvent = data.on.input

    return h(QCard, {}, [
      h(QCardSection, {}, [
        h('div', { domProps: { class: 'row no-wrap' } }, [
          h(
            Widget,
            {
              props: {
                ...props,
                label: parent.$filter('capitalize')(parent.$t('cmp.from')),
                value: value.min || null
              },
              on: {
                input (min) {
                  inputEvent && inputEvent(value.join({ min }))
                }
              }
            }
          ),
          h(
            Widget,
            {
              props: {
                ...props,
                label: parent.$filter('capitalize')(parent.$t('cmp.to')),
                value: value.max || null
              },
              on: {
                input (max) {
                  inputEvent && inputEvent(value.join({ max }))
                }
              }
            }
          )
        ])
      ])
    ])
  }
}
