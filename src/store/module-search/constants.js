import { createEnum } from 'src/lib/utils'

export const STATES = createEnum([
  // Nothing done (we don't event have a query)
  'INITIAL',

  // We have a query
  'HAS_QUERY',

  // Loading the results
  'LOADING_RESULTS',

  // A list of all the available results have been loaded
  'RESULTS_LOADED'
])
