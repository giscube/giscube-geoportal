import L from 'src/lib/leaflet'

export default {
  engine: null,
  query: null,
  history: [],
  errorFetching: false,
  fetchingResults: null,
  finalResults: null,
  optionResult: null,
  result: null,
  resultsLayer: L.featureGroup(),
  currentLayer: null,
  auto: true
}
