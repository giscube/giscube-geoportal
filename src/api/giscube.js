import axios from 'axios'
import { throwUnhandledExceptions } from '../lib/promiseUtils.js'

export default {
  uploadPhoto (source, photo, customConfig) {
    const url = source.url + 'api/v1/giscube/user-assets/'
    const config = {
      // defaults
      timeout: 600000, // 10 * 60 * 1000, // => 10 minutes

      // custom
      ...customConfig,

      // mandatory
      headers: {
        'Authorization': 'Bearer KoXXdGqE3MopmVQCHV2d1HFJ77bilq'
      }
    }
    const data = new FormData()
    data.append('file', photo)

    const promise = new Promise((resolve, reject) => {
      axios.post(url, data, config)
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
