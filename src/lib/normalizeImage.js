import loadImage from 'blueimp-load-image'

export default function normalizeImage (file, size) {
  return new Promise((resolve, reject) => {
    try {
      loadImage(
        file,
        canvas => {
          try {
            canvas.toBlob(blob => resolve(new File([blob], file.name)), file.type)
          } catch (e) {
            reject(e)
          }
        },
        {
          canvas: true,
          orientation: true,
          maxWidth: size,
          maxHeight: size
        }
      )
    } catch (e) {
      reject(e)
    }
  })
}
