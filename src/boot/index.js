import axios from './axios'
import config from './config'
import except from './except'
import i18n from './i18n'
import moment from './moment'
import proj4 from './proj4'
import clipboard from './clipboard'

function setup (conf = {}) {
  return async function () {
    // specialization supported
    await config.setup(conf.config).apply(this, arguments)
    await i18n.setup(conf.i18n).apply(this, arguments)

    // simple imports without specialization
    await axios.apply(this, arguments)
    await moment.apply(this, arguments)
    await proj4.apply(this, arguments)
    await except.apply(this, arguments)
    await clipboard.apply(this, arguments)
  }
}

const geoportalBoot = setup()
geoportalBoot.setup = setup

export default geoportalBoot
