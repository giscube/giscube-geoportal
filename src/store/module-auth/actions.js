import axios from 'axios'
import except from '../../lib/except'

export function credentialsLogin (context, { username, password }) {
  const apiUrl = this.$config.oauth.token
  const data = new FormData()
  data.set('grant_type', 'password')
  data.set('client_id', this.$config.oauth.client_id)
  data.set('username', username)
  data.set('password', password)

  const requestConfig = {
    timeout: 10000
  }
  return new Promise((resolve, reject) => {
    axios.post(apiUrl, data, requestConfig)
      .then(response => {
        context.commit('setAccessToken', response.data.access_token)
        context.commit('setUsername', username)
        context.dispatch('saveState')
        resolve()
      })
      .catch(error => {
        const invalidCredentials = error.request && [400, 401].includes(error.request.status)
        if (invalidCredentials) {
          context.commit('setAccessToken', null)
        } else {
          except(error)
        }
        reject({ error, invalidCredentials })
      })
  })
}

export function loadState (context) {
  let accessToken = localStorage.getItem('access_token')
  let username = localStorage.getItem('username')
  context.commit('setAccessToken', accessToken)
  context.commit('setUsername', username)

  if (!username) {
    context.dispatch('updateUserInfo')
  }
}

function localStorageSave (key, value) {
  if (value === null) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, value)
  }
}

export function logout (context) {
  const apiUrl = this.$config.oauth.revokeToken
  const requestConfig = {
    timeout: 10000
  }
  const data = new FormData()
  data.set('client_id', this.$config.oauth.client_id)
  data.set('token', context.state.accessToken)

  return new Promise((resolve, reject) => {
    axios.post(apiUrl, data, requestConfig)
      .then(_ => {
        context.commit('setAccessToken', null)
        context.commit('setUsername', null)
        context.dispatch('saveState')
        resolve()
      })
      .catch(reject)
  })
}

export function observeAuth (context, { seconds }) {
  setTimeout(function () {
    let accessToken = localStorage.getItem('access_token')
    if (accessToken && accessToken !== context.state.accessToken) {
      context.commit('setAccessToken', accessToken)
      context.dispatch('updateUserInfo')
    } else if (seconds > 0) {
      context.dispatch('observeAuth', { seconds: seconds - 1 })
    } else {
      console.warn('Gave up waiting for access token')
    }
  }, 1000)
}

export function saveState (context) {
  localStorageSave('access_token', context.state.accessToken)

  if (this.$config.oauth.type === 'password') {
    localStorageSave('username', context.state.username)
  } else {
    localStorage.removeItem('username')
  }

  context.dispatch('dataLayer/invalidateState', void 0, { root: true })
  context.dispatch('search/invalidateState', void 0, { root: true })
}

export function updateUserInfo (context) {
  context.dispatch('dataLayer/refreshSources', void 0, { root: true })
  if (context.state.accessToken === null) {
    return
  }
  if (!(this.$config.oauth && this.$config.oauth.profile)) {
    return
  }

  let apiUrl = this.$config.oauth.profile
  var requestConfig = {
    timeout: 10000,
    headers: {
      'Authorization': 'Bearer '.concat(context.state.accessToken)
    },
    maxRedirections: 0
  }

  axios.get(apiUrl, requestConfig)
    .then(response => {
      context.commit('setUsername', response.data.username)
    })
    .catch(error => {
      if (error.request && error.request.status >= 300 && (error.request.status < 400 || error.request.status === 401 || error.request.status === 403)) {
        context.commit('setAccessToken', null)
      } else {
        except(error)
      }
    })
}
