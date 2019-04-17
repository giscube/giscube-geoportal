export function headers (state) {
  const headers = {}
  if (state.accessToken) {
    headers['Authorization'] = `Bearer ${state.accessToken}`
  }

  return headers
}

export function config (state, getters) {
  return { headers: getters.headers }
}
