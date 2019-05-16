function getImageSize (fileURL) {
  return new Promise((resolve, reject) => {
    const el = new Image()
    el.onload = () => {
      resolve({ width: el.naturalWidth, height: el.naturalHeight })
    }
    el.onerror = reject
    el.src = fileURL
  })
}

function calcSize (original, target, keepRatio) {
  if (!keepRatio) {
    return target
  }

  const oratio = original.width / original.height
  const tratio = target.width / target.height
  if (oratio > tratio) {
    const scale = target.width / original.width
    return {
      width: target.width, // original.width * ratio
      height: original.height * scale
    }
  } else {
    const scale = target.height / original.height
    return {
      width: original.width * scale,
      height: target.height // original.height * ratio
    }
  }
}

function createCanvas (size) {
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  return canvas
}

function drawImage (canvas, fileURL, size) {
  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  return new Promise((resolve, reject) => {
    const el = new Image()
    el.width = size.width
    el.height = size.height
    el.onload = () => {
      context.drawImage(el, 0, 0, size.width, size.height)
      resolve()
    }
    el.onerror = reject
    el.src = fileURL
  })
}

function getPNG (canvas, type) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(resolve, type)
  })
}

export default async function resizeImage (file, { width, height, keepRatio = true, stretch = false } = {}) {
  if (!width || !height) {
    return file
  }

  const fileURL = URL.createObjectURL(file)

  const originalSize = await getImageSize(fileURL)
  if (!stretch && (width > originalSize.width || height > originalSize.height)) {
    URL.revokeObjectURL(fileURL)
    return file
  }

  const size = calcSize(originalSize, { width, height }, keepRatio)

  const canvas = createCanvas(size)
  await drawImage(canvas, fileURL, size)

  const result = new File([await getPNG(canvas, file.type)], file.name)

  URL.revokeObjectURL(fileURL)

  return result
}
