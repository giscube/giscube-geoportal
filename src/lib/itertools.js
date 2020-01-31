function _forward (v) {
  return v
}

export function* filter (it, callback) {
  for (let v of it) {
    if (callback(it)) {
      yield v
    }
  }
}

export function* map (it, callback) {
  for (let v of it) {
    yield callback(v)
  }
}

export function* enumerate (it, start = 0) {
  let i = start
  for (let value of it) {
    yield [i, value]
    ++i
  }
}

export function* zip (...its) {
  const iterators = its.map(it => it[Symbol.iterator]())
  for (;;) {
    const next = iterators.map(it => it.next())
    if (some(next, result => !result.done)) {
      break
    }
    yield next.map(result => result.value)
  }
}

export function every (it, callback = _forward) {
  for (let v of it) {
    if (!callback(v)) {
      return false
    }
  }
  return true
}

export function some (it, callback = _forward) {
  for (let v of it) {
    if (callback(v)) {
      return true
    }
  }
  return false
}
