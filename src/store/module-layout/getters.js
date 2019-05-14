export function drawersFullOverlay (state) {
  return state.drawerBehavior === 'mobile' || state.drawerBreakpoint >= state.size.width
}
