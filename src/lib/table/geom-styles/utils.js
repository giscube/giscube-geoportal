export function toNumber (value, d) {
  const v = parseFloat(value)
  return isNaN(v) ? d : v
}

export function tryToNumber (v) {
  return toNumber(v, v)
}
