export function throwUnhandledExceptions (promise) {
  return new Promise((resolve, reject) => {
    promise.then(resolve).catch(reject)
  })
}
