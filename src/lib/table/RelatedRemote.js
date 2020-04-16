import { CancelToken, isCancel } from 'axios'
import Vue from 'vue'

import databaseLayersApi from 'src/api/databaselayers'

import TableInfo from './TableInfo'

export default class RelatedRemote {
  constructor (source, fk, getConfig) {
    this.source = source
    this.toField = fk.toField
    this.layer = fk.layer
    this.getConfig = getConfig
    this.fetching = false
  }

  async fetchInfo () {
    const response = await databaseLayersApi.getLayerInfo(this.source, this.layer, this.getConfig())
    return new TableInfo(response.data, this.constFields)
  }

  requestData (ids) {
    this.fetching = true

    const args = {
      source: this.source,
      layer: this.layer,
      colFilters: {
        [this.toField + '__in']: Array.from(ids).join(',')
      }
    }

    const cancelToken = CancelToken.source()
    const cancel = cancelToken.cancel
    this._cancelFetch = cancel

    const config = {
      ...this.getConfig(),
      cancelToken: cancelToken.token
    }

    return new Promise((resolve, reject) => {
      databaseLayersApi.getData(args, config)
        .then(async response => {
          await Vue.nextTick()
          if (this._cancelFetch !== cancel) {
            resolve()
          } else if (isCancel(response)) {
            this.fetching = false
            resolve()
          } else {
            this.fetching = false
            resolve(response.data)
          }
        })
        .catch(error => {
          if (isCancel(error)) {
            this.fetching = false
            resolve()
          } else {
            if (this._cancelFetch === cancel) {
              this.fetching = false
            }
            reject(error)
          }
        })
    })
  }
}
