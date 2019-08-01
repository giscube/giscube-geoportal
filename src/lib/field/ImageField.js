import axios from 'axios'

import giscubeApi from '../../api/giscube.js'
import AsyncValue from '../async/Value'

import Field from './Field'
import ImageFormWidget from './widgets/form/Image'
import ImageTableWidget from './widgets/table/Image'

export class AsyncPhoto extends AsyncValue {
  constructor (photo, source, authHeaders) {
    const tokenSource = axios.CancelToken.source()
    const job = {
      func: () => {
        return giscubeApi.uploadPhoto(
          source,
          this.photo,
          {
            cancelToken: tokenSource.token,
            headers: authHeaders
          }
        )
      },
      cancel (job) {
        tokenSource.cancel()
      }
    }

    super(job)

    this.setPhoto(photo)

    if (photo instanceof Promise) {
      photo.then(
        photo => this.setPhoto(photo),
        _ => {}
      )
    }

    this.getValue()
      .then(result => {
        URL.revokeObjectURL(this.tempUrl)
        this.tempUrl = null
      })
      .catch(() => {}) // not our responsibility
  }

  get delay () {
    return this.photo instanceof Promise
  }

  setPhoto (photo) {
    this.photo = photo
    this.tempUrl = photo && !(photo instanceof Promise) && URL.createObjectURL(photo)
  }
}

export default class ImageField extends Field {
  constructor (info) {
    const options = info.widget_options
    const size = options.upload_size || 1024
    delete options.upload_size

    super(info)

    this.size = {
      width: size,
      height: size
    }
    this.requiresFeatures = true
  }

  tableValue (data) {
    return ImageTableWidget
  }

  formWidget () {
    return ImageFormWidget
  }

  repr (data) {
    let value = this.getValue(data)
    if (value instanceof AsyncValue) {
      value = value.done ? value.result : null
    }
    return value ? value.value || value.src : null
  }

  str (data) {
    let value = this.getValue(data)
    if (value instanceof AsyncValue) {
      value = value.done ? value.result : null
    }
    return ImageField.urlFilename(value) || ''
  }

  popupValue (data) {
    const value = this.getValue(data)
    if (value instanceof AsyncValue) {
      return value.done ? value.result : null
    } else {
      return value
    }
  }

  static getUrl (value) {
    if (!value) {
      return value
    }

    if (value instanceof AsyncValue) {
      if (value.done) {
        return ImageField.getUrl(value.result)
      } else {
        return value.tempUrl
      }
    } else {
      return value.src
    }
  }

  static getThumbnail (value) {
    if (!value) {
      return value
    }

    if (value instanceof AsyncValue) {
      if (value.done) {
        return ImageField.getThumbnail(value.result)
      } else {
        return value.tempUrl
      }
    } else {
      return value.thumbnail || value.src
    }
  }

  static getFilename (value) {
    if (!value) {
      return value
    }

    if (AsyncValue.is(value)) {
      if (value.done) {
        return ImageField.getFilename(value.result)
      } else {
        return value.photo.name
      }
    } else {
      return ImageField.urlFilename(value.src)
    }
  }

  static urlFilename (url) {
    if (!url) {
      return url
    }

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
}
