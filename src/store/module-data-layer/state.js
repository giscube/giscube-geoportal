import { AsyncQueue } from 'src/lib/async'

export default {
  sources: null,
  loadingSourceErrors: [],
  table: null,
  filterPolygon: null,
  updateWms: Promise.resolve(),
  asyncQueue: new AsyncQueue()
}
