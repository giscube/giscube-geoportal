import { AsyncQueue } from 'src/lib/async'

export default {
  sources: null,
  loadingSourceErrors: [],
  table: null,
  asyncQueue: new AsyncQueue()
}
