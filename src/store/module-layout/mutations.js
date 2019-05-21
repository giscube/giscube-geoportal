export function leftDrawerSize (state, value) {
  state.leftDrawerSize = value
}

export function sidebarVisible (state, value) {
  state.sidebarVisible = value
}

export function size (state, value) {
  state.size = value
}

export function printing (state, value) {
  state.printing = value
}

export function addDialog (state, obj) {
  state.dialogs.unshift(obj)
}

export function removeDialog (state, obj) {
  const i = state.dialogs.indexOf(obj)
  if (i >= 0) {
    state.dialogs.splice(i, 1)
  }
}
