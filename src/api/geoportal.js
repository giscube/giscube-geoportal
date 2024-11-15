import axios from 'axios'

export default {
  newLayerRegister (registers, layerOptions, config, username) {
    if (registers != null) {
      const body = {
        layer_name: layerOptions.title,
        giscube_id: layerOptions.result.giscube_id
      }
      const url = `${registers.url}/layer-register/`.replaceAll('//layer', '/layer')
      this.newObjectRegister(url, body, config, username)
    }
  },
  newToolRegister (registers, toolName, config, username) {
    if (registers != null) {
      const body = {
        tool_name: toolName
      }
      const url = `${registers.url}/tool-register/`.replaceAll('//tool', '/tool')
      this.newObjectRegister(url, body, config, username)
    }
  },
  newObjectRegister (url, data, config, username) {
    const body = {
      datetime: new Date().toISOString(),
      username: username,
      ...data
    }
    const conf = {
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    }
    axios.post(url, body, conf)
  }
}
