import L from 'src/lib/leaflet'

export default {
  query: null,
  history: [],
  errorFetching: false,
  fetchingResults: null,
  finalResults: null,
  result: null,
  resultsLayer: L.featureGroup()
}
