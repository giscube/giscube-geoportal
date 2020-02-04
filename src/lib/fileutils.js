export function fileToText (file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onerror = reject
    fileReader.onabort = reject
    fileReader.onload = evt => resolve(evt.target.result)
    fileReader.readAsText(file)
  })
}

export async function jsonFileToObject (file) {
  const text = await fileToText(file)
  return JSON.parse(text)
}
