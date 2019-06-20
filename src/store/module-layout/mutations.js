import Vue from 'vue'

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
  state.dialogs.push(obj)
}

export function removeDialog (state, obj) {
  const dialogs = state.dialogs
  // delete
  {
    const i = dialogs.indexOf(obj)
    state.dialogs[i] = void 0
  }

  // cleanup
  {
    let i = dialogs.length - 1
    for (; i >= 0; --i) {
      if (dialogs[i]) {
        break
      }
    }

    // i is the last element (-1 if empty)
    // i + 1 is the length that it should have
    Vue.set(dialogs, 'length', i + 1)
  }
}
