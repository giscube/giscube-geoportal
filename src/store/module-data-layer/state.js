import { AsyncQueue } from 'src/lib/async'

export default {
  sources: null,
  loadingSourceErrors: [],
  table: null,
  filterPolygon: null,
  asyncQueue: new AsyncQueue()
}
