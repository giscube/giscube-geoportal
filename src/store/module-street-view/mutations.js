export function towards (state, value) {
  if (!value || value.lat === null || value.lat === undefined || value.lng === null || value.lng === undefined) {
    state.towards = null
  } else {
    state.towards = value
  }
}
