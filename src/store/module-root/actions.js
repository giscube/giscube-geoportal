export function removeQuery (context, value) {
  if (context.state.query === value) {
    context.commit('setQuery', null)
  }
}

export function openReference (context, overlay) {
  const id = overlay.id
  if (!id) {
    return
  }

  const canOpen = id.canOpen && id.canOpen()
  if (canOpen) {
    id.openInSidebar({
      context,
      $router: this.$router
    })
  }
}
