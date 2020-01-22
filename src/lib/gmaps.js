// From https://github.com/maoberlehner/using-the-google-maps-api-with-vue

// Your personal API key.
// Get it here: https://console.cloud.google.com/google/maps-apis
// const API_KEY = `AIzaSyCWAaBJsIvwbrbTI18PITVy7p0Qb6htM1k`
const CALLBACK_NAME = `gmapsCallback`

let initialized = !!(window.google && window.google.maps)
let resolveInitPromise
let rejectInitPromise
// This promise handles the initialization
// status of the google maps script.
const initPromise = new Promise((resolve, reject) => {
  resolveInitPromise = resolve
  rejectInitPromise = reject
})

export default function init (API_KEY) {
  // If Google Maps already is initialized
  // the `initPromise` should be resolved
  // eventually.
  if (initialized) return initPromise

  initialized = true
  // The callback function is called by
  // the Google Maps script if it is
  // successfully loaded.
  window[CALLBACK_NAME] = () => resolveInitPromise(window.google)

  // We inject a new script tag into
  // the `<head>` of our HTML to load
  // the Google Maps script.
  const script = document.createElement(`script`)
  script.async = true
  script.defer = true
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry&callback=${CALLBACK_NAME}`
  script.onerror = rejectInitPromise
  document.querySelector(`head`).appendChild(script)

  return initPromise
}
