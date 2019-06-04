function conformsNullRule (obj, op, value) {
  return false
}

function conformsNumberRule (obj, op, value) {
  switch (op) {
    case '=':
      return obj === value
    case '!=':
      return obj !== value
    case '>':
      return obj > value
    case '>=':
      return obj >= value
    case '<':
      return obj < value
    case '<=':
      return obj <= value
    default:
      console.warn('Unsupported operand: ' + op)
      return false
  }
}

function conformsStringRule (obj, op, value) {
  switch (op) {
    case '=':
    case '!=':
    case '>':
    case '>=':
    case '<':
    case '<=':
      return conformsNumberRule(obj.localeCompare(value), op, 0)
    default:
      console.warn('Unsupported operand: ' + op)
      return false
  }
}

function conformsRule (obj, op, value) {
  const type = typeof obj

  if (obj === null || obj === undefined) {
    return conformsNullRule(obj, op, value)
  } else if (type === 'string') {
    return conformsStringRule(obj, op, value)
  } else if (type === 'number') {
    return conformsNumberRule(obj, op, parseFloat(value))
  } else {
    console.warn('Unsupported obj type: ' + type)
    return false
  }
}

export default class StyleRule {
  constructor (key, op, value, style) {
    this.key = key
    this.op = op
    this.value = value
    this.style = style
  }

  check (row) {
    return conformsRule(row.properties[this.key], this.op, this.value)
  }
}
