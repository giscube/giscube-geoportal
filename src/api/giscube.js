import axios from 'axios'
import { throwUnhandledExceptions } from '../lib/promiseUtils.js'

export default {
  uploadPhoto (source, photo, config) {
    const url = source.url + 'api/v1/giscube/user-assets/'
    const conf = {
      timeout: 600000, // 10 * 60 * 1000, // => 10 minutes
      ...config
    }
    const data = new FormData()
    data.append('file', photo)

    const promise = new Promise((resolve, reject) => {
      axios.post(url, data, conf)
        .then(response => {
          const result = {
            src: response.data.url,
            thumbnail: response.data.thumbnail,
            value: response.data.file
          }
          resolve(result)
        }, reject)
    })
    return throwUnhandledExceptions(promise)
  }
}
