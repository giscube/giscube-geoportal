export function setAccessToken (state, value) {
  state.accessToken = value
  if (value === null) {
    localStorage.removeItem('access_token')
  } else {
    localStorage.setItem('access_token', value)
  }
}

export function setUsername (state, value) {
  state.username = value
}

export function setProfile (state, value) {
  state.profile = value
}

export function setLastLogin (state, value) {
  state.lastLogin = value
}
