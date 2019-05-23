function colorToRGBA (color) {
  const canvas = document.createElement('canvas')
  canvas.height = canvas.width = 1
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  return ctx.getImageData(0, 0, 1, 1).data
}

function byteToHex (num) {
  return num.toString(16).padStart(2, '0') // to range 00 - FF
}

export function standarizeColour (color) {
  const hex = Array.from(colorToRGBA(color), byteToHex).join('')
  return '#' + hex
}

function limit (value, min, max) {
  return Math.min(Math.max(min, value), max)
}

export function colorLuminance (hex, lum) {
  let rgb = '#'
  for (let i = 0; i < 3; i++) {
    const j = i * 2 + 1
    const n = parseInt(hex.substring(j, j + 2), 16)
    const c = Math.round(limit(n + (n * lum), 0, 255))
    rgb += c.toString(16).padStart(2, '0')
  }

  return rgb + hex.substring(7)
}
