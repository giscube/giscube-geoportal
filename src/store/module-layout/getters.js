export function drawersOverlaying (state) {
  return state.drawerBehavior === 'mobile' || state.drawerBreakpoint >= state.size.width || state.drawerOverlay
}
