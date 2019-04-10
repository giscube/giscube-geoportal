import AsyncQueue from '../../lib/async/Queue'

export default {
  sources: null,
  current: null,
  geojson: null,
  layerConfig: {
    options: {},
    layerInfo: null,
    fields: null
  },
  editStatus: {
    editing: false,
    adding: false,
    saving: false,
    originals: {},
    newPkGenerator: null
  },
  table: {
    features: [],
    selected: []
  },
  uploadQueue: new AsyncQueue()
}
