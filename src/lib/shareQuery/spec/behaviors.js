const behaviors = {}

behaviors.overrides = function (a, b) {
  return b
}

behaviors.merges = function (a, b) {
  if (a && b) {
    return Object.assign({}, a, b)
  } else if (!b) {
    return a
  } else {
    return b
  }
}

// export values
export { behaviors as default, behaviors }
