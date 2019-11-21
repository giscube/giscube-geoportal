import { STATES } from './constants.js'

export function results (state) {
  return state.finalResults || (state.fetchingResults && state.fetchingResults.flat())
}

export function state (state) {
  if (state.finalResults) {
    return STATES.RESULTS_LOADED
  } else if (state.fetchingResults) {
    return STATES.LOADING_RESULTS
  } else if (state.history.length > 0) {
    return STATES.HAS_QUERY
  } else {
    return STATES.INITIAL
  }
}
