import Field from './Field'
import ImageFormWidget from './widgets/form/Image'
import ImageTableWidget from './widgets/table/Image'

export default class ImageField extends Field {
  static urlFilename (url) {
    const expr = /[:/]([^:/?]+)(?:\?.*)?$/g
    // from the last : or / to the end
    //
    // http://exemple.com/folder/xxx.json
    //                          ^~~~~~~~^  => xxx.json
    // media:xxx.json
    //      ^~~~~~~~^  => xxx.json

    const result = expr.exec(url)
    if (result) {
      return result[1]
    }
  }

  tableValue (data) {
    return ImageTableWidget
  }

  formWidget () {
    return ImageFormWidget
  }

  repr (data) {
    const value = this.getValue(data)
    return value ? value.value || value.src : null
  }

  str (data) {
    const value = this.getValue(data)
    return ImageField.urlFilename(value) || ''
  }
}
