import AsyncQueue from 'src/lib/async/Queue'

export default {
  sources: null,
  loadingSourceErrors: [],
  table: null,
  uploadQueue: new AsyncQueue()
}
