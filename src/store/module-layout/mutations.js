import Vue from 'vue'

export function isCustomView (state, value) {
  state.isCustomView = value
}

export function leftDrawerSize (state, value) {
  state.leftDrawerSize = value
}

export function sidebarOpen (state, value) {
  state.sidebarOpen = value
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

export function setMapControlled (state, value) {
  state.mapControlled = value
}

export function setdeactivateClick (state, value) {
  state.deactivateClick = value
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

export function setLayout (state, value) {
  if (value === 'simple') {
    state.headerVisible = false
    state.sidebarVisible = false
    state.sidebarOpen = false
    state.toolsControlVisible = false
  } else {
    state.headerVisible = true
    state.sidebarVisible = true
    state.toolsControlVisible = true
  }
}
