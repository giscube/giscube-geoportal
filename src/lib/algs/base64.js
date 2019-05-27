const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

export function fromUInt16 (n) {
  return table[(n & 0xFC00) >>> 10] + table[(n & 0X03F0) >>> 4] + table[(n & 0X000F) << 2]
  // + '=' if padding is wanted
}

export function toUInt16 (str) {
  let l = str.length

  // avoid padding
  while (l > 0 && str[l - 1] === '=') {
    --l
  }

  const a = l >= 3 ? table.indexOf(str[l - 3]) << 10 : 0
  const b = l >= 2 ? table.indexOf(str[l - 2]) << 4 : 0
  const c = l >= 1 ? table.indexOf(str[l - 1]) >>> 2 : 0

  return a | b | c
}
