import AsyncQueue from 'src/lib/async/Queue'

export default {
  sources: null,
  table: null,
  defaultRow: null,
  uploadQueue: new AsyncQueue()
}
