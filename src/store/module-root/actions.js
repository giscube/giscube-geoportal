export function removeQuery (context, value) {
  if (context.state.query === value) {
    context.commit('setQuery', null)
  }
}
