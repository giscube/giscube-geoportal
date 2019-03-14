import _ from 'lodash'

export default class Options {
  constructor (config) {
    Object.assign(this, config)
  }

  merge (config) {
    return _.mergeWith(this, config, (objValue, srcValue, key) => {
      if (_.isArray(objValue)) {
        if (key.endsWith('__append')) {
          return objValue.concat(srcValue)
        } else {
          return srcValue
        }
      }
    })
  }
}
