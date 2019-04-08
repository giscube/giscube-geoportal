import axios from 'axios'
import config from '../../config'

export function loadState (context) {
  let accessToken = localStorage.getItem('access_token')
  context.commit('setAccessToken', accessToken)
  context.dispatch('updateUserInfo')
}

export function logout (context) {
  context.commit('setAccessToken', null)
  context.commit('setUsername', null)
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
      console.log('Gave up waiting for access token')
    }
  }, 1000)
}

export function updateUserInfo (context) {
  if (context.state.accessToken === null) {
    return
  }
  if (!(config.oauth && config.oauth.profile)) {
    return
  }

  let apiUrl = config.oauth.profile
  var requestConfig = {
    timeout: 10000,
    headers: {
      'Authorization': 'Bearer '.concat(context.state.accessToken)
    }
  }

  console.info('Get user details from ', apiUrl)
  axios.get(apiUrl, requestConfig)
    .then(response => {
      context.commit('setUsername', response.data.username)
    })
    .catch(error => {
      if (error.request && error.request.status === 401) {
        context.commit('setAccessToken', null)
      } else {
        console.log(error)
      }
    })
}
