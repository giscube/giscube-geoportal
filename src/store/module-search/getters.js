import { STATES } from './constants.js'

/**
 * @babel/polyfill@^7.4.0 is supposed to include "flat", but that doesn't work of us -
 * presumably because transitive dependencies still include babel 6 and the
 * corresponding babel-polyfill package. So we include this "manual" polyfill for now.
 *
 * https://github.com/babel/babel/issues/9749
 */
function flat (arrays) {
  return [].concat.apply([], arrays)
}

export function results (state) {
  return state.finalResults || flat(state.fetchingResults && state.fetchingResults)
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
