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
      func: giscubeApi.uploadPhoto,
      args: [
        source,
        photo,
        {
          cancelToken: tokenSource.token,
          headers: authHeaders
        }
      ],
      cancel (job) {
        tokenSource.cancel()
      }
    }

    super(job)

    this.photo = photo
    this.tempUrl = URL.createObjectURL(photo)
    this.getValue()
      .then(result => {
        this.tempUrl = null
        URL.revokeObjectURL(this.tempUrl)
      })
      .catch(() => {}) // not our responsibility
  }
}

export default class ImageField extends Field {
  constructor (info) {
    super(info)
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
    return this.getValue(data)
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
      return value && value.src
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
      return value && (value.thumbnail || value.src)
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
