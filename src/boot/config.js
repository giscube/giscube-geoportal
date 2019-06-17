import Options from 'src/lib/options'
import original from 'src/config'

function setup (conf) {
  // support to merge here and on the children's config
  let config = original
  if (conf) {
    if (conf instanceof Options) {
      config = conf
    } else {
      config = original.merge(conf)
    }
  }

  return async ({ Vue }) => {
    Vue.prototype.$config = config
  }
}

const configBoot = setup()
configBoot.setup = setup

export default configBoot
