const MULTIVALUE = Symbol('Multiple values')

export class MultiResult {
  constructor (values) {
    this.symbol = MULTIVALUE
    this.values = values ? new Set(values) : new Set()
    Object.freeze(this)
  }

  static is (obj) {
    return obj && obj.symbol === MULTIVALUE
  }
}
