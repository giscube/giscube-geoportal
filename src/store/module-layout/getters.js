export function drawersFullOverlay (state) {
  return state.drawerBehavior === 'mobile' || state.drawerBreakpoint >= state.size.width
}

export function hiddenMap (state) {
  const sidebarOverlaying = drawersFullOverlay(state)
  const sidebarVisible = state.sidebarVisible

  return {
    right: 0,
    left: (!sidebarOverlaying && sidebarVisible) ? state.leftDrawerSize : 0,
    top: 0,
    bottom: 0
  }
}
