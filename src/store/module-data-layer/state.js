import { AsyncQueue } from 'src/lib/async'

export default {
  sources: null,
  loadingSourceErrors: [],
  table: null,
  updateWms: Promise.resolve(),
  asyncQueue: new AsyncQueue()
}
