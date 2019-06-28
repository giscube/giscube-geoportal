export function toNumber (value, d) {
  const v = parseFloat(value)
  return isNaN(v) ? d : v
}

export function tryToNumber (v) {
  return toNumber(v, v)
}

export const STATUS_STYLES = {
  deleted: {
    fill: '#ad3e3e',
    stroke: '#6d2727',
    icon: 'close'
  },
  selected: {
    fill: '#3f82af',
    stroke: '#285370',
    icon: 'check'
  },
  new: {
    fill: '#45b240',
    stroke: '#2c7229',
    icon: 'add'
  },
  edited: {
    fill: '#ad8f3e',
    stroke: '#6b5826',
    icon: 'edit'
  }
}

const DEFAULT_ORDER = ['deleted', 'selected', 'new', 'edited']

Object.defineProperties(STATUS_STYLES, {
  getByOrder: {
    value (order, status) {
      const current = order.find(key => status[key])
      return current && this[current]
    }
  },
  get: {
    value (status) {
      return this.getByOrder(DEFAULT_ORDER, status)
    }
  }
})
