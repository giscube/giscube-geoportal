export function drawersFullOverlay (state) {
  return state.drawerBehavior === 'mobile' || state.drawerBreakpoint >= state.size.width
}

export function leftDrawerVisibleSize (state, getters) {
  const sidebarOverlaying = getters['drawersFullOverlay']
  const sidebarOpen = state.sidebarOpen
  return (!sidebarOverlaying && sidebarOpen) ? state.leftDrawerSize : 0
}

export function hiddenMap (state, getters) {
  return {
    right: 0,
    left: getters['leftDrawerVisibleSize'],
    top: 0,
    bottom: 0
  }
}

export function dialog (state) {
  return state.dialogs.length > 0 && state.dialogs[0]
}

export function mapLoading (state, getters, rootState, rootGetters) {
  return rootGetters['dataLayer/mapLoading']
}
