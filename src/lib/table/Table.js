import L from 'src/lib/leaflet'
import { CancelError, eachLayer, layersBounds } from 'src/lib/geomUtils'
import { rowsInGeom } from 'src/lib/layersInGeom'
import Vue from 'vue'

import DBFormDialog from 'components/data-layer/DBFormDialog'

import Popup from './Popup'
import Remote from './Remote'
import * as Row from './row'

export class EditingError extends Error {
  constructor () {
    super('The action couldn\'t be performed because the table is being edited')
    this.error = 'EditingError'
  }
}

const tileSize = Math.pow(2, Math.round(Math.log2(Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight) / 2.5)))

export default class Table {
  constructor (source, layer, root, contantFields) {
    const getConfig = () => root.$store.getters['auth/config']
    this.remote = new Remote(source, layer, getConfig, contantFields)
    this.info = null

    this.rows = []
    this.selected = new Set() /// selected rows' pks
    this.selectedList = [] // Vue won't support sets (until vue 3.0). Convert it manually
    this.visibleSelectedList = []

    Object.defineProperties(this, {
      map: {
        configurable: true,
        enumerable: false,
        writable: true,
        value: null
      },
      $root: {
        configurable: true,
        enumerable: false,
        writable: false,
        value: root
      },
      _popup: {
        configurable: true,
        enumerable: false,
        writable: true,
        value: null
      }
    })

    this._originals = []

    this.editing = false
    this.adding = false
    this.saving = false
  }

  get fields () {
    return (this.info && this.info.fields) || []
  }

  get formFields () {
    return (this.info && this.info.formFields) || []
  }

  get logicFormFields () {
    return (this.info && this.info.logicFormFields) || []
  }

  get mapDependent () {
    return !!this.remote.filters.bbox
  }

  get popup () {
    return this._popup || (this._popup = new Popup(this.$root))
  }

  get tableFields () {
    return (this.info && this.info.tableFields) || []
  }

  addTo (map) {
    this.map = map || this.map
    if (!this.map) {
      return
    }

    if (this.layer) {
      this.layer.addTo(this.map)
    }
    if (this.refLayers && this.map.layerswitcher) {
      const layersControl = this.map.layerswitcher
      this.refLayers.forEach(info => {
        info.layer.addTo(this.map)
        info._options = layersControl.addOverlay(info.layer, info.title)
      })
    }
  }

  discard () {
    this.editing = false
    if (this.info.hasGeom && this.map) {
      eachLayer(this.layer, l => l.disableEdit(this.map))
    }

    for (let i = this.rows.length - 1; i >= 0; --i) {
      const r = this.rows[i]
      if (r.status.new) {
        r.remove()
        this.rows.splice(i, 1)
        this.selected.delete(r.internalPk)
      } else {
        r.revert()
        r.status.deleted = false
      }
    }
    this.updateSelectedList()
  }

  deleteSelected () {
    const selectedRows = this.visibleSelectedList
    const del = !selectedRows.every(row => row.status.deleted)
    selectedRows.forEach(row => {
      row.status.deleted = del
      row.applyStyle()
    })
  }

  fetchInfo () {
    return this.remote.fetchInfo()
      .then(info => {
        this.info = info

        if (info.hasGeom) {
          this.removeLayers()
          Object.defineProperty(this, 'layer', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: L.layerGroup()
          })
        }

        if (info.referenceLayers && info.referenceLayers.length > 0) {
          const token = this.$root.$store.state.auth.accessToken
          const refLayers = this.info.referenceLayers.map(info => {
            const url = `${info.url}?access_token=${token}`
            const layer = L.tileLayer.wms(url, {
              maxZoom: 22,
              ...(info.options || {}),
              tileSize
            })
            return {
              layer,
              title: info.title
            }
          })

          Object.defineProperty(this, 'refLayers', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: refLayers
          })
        }

        if (this.map) {
          this.addTo(this.map)
        }

        return this.info
      })
  }

  getSelectedBounds () {
    if (this.info.hasGeom && this.layer) {
      const layers = this.visibleSelectedList
        .map(row => row.layer)
        .filter(layer => !!layer)

      return layersBounds(layers)
    }
  }

  getVisibleBounds () {
    if (this.info.hasGeom && this.layer) {
      return layersBounds(this.layer.getLayers())
    }
  }

  async makeRows ({ map, base, editMultiple, dialogForNew, selectNews }) {
    this.adding = true
    editMultiple = editMultiple && this.info.hasGeom
    try {
      do {
        const row = await this.rowFromDefault({ base, map })
        if (selectNews) {
          row.status.selected = true
        }
        if (dialogForNew) {
          await row.uiEdit()
        }

        // Disable eslint because when looping we stop when an exception is thrown
        //   most likely a cancellation
        // eslint-disable-next-line no-unmodified-loop-condition
      } while (editMultiple)
    } catch (e) {
      if (!(e instanceof CancelError)) {
        throw e
      }
    } finally {
      this.adding = false
    }
  }

  newRow (data) {
    return Row.toRow(this, data, this.remote.constFields)
  }

  removeLayers () {
    if (this.layer) {
      this.layer.remove()
    }

    const layersControl = this.map.layerswitcher
    if (layersControl && this.refLayers) {
      this.refLayers.forEach(info => {
        layersControl.removeLayer(info._options)
        delete info._options
      })
    }
  }

  async rowFromDefault (opts) {
    const base = opts.base
    delete opts.base

    const row = await base.asNew(opts)
    this.rows.push(row)
    if (this.info.hasGeom) {
      this.layer.addLayer(row.layer)
    }
    return row
  }

  select (keys, { added = true } = {}) {
    if (added) {
      keys.forEach(k => this.selected.add(k))
    } else {
      keys.forEach(k => this.selected.delete(k))
    }

    this.updateSelectedList()
  }

  selectByPolygon (layer) {
    this.selectRows(rowsInGeom(this.rows, layer))
  }

  selectRows (rows, ...args) {
    this.select(rows.map(r => r.internalPk), ...args)
    rows.forEach(row => {
      row.applyStyle()
    })
  }

  /// Sets the new data
  setData (data) {
    if (this.rows.length === 0) {
      const rows = Row.toRows(this, data)
      rows.forEach(row => row.add())
      this.rows = rows
      return
    }

    const currentPks = new Set(this.rows.map(row => row.pk))
    const newRows = Row.toRows(this, data)
    const newPks = new Set(newRows.map(row => row.pk))

    // Remove the unused rows
    const toRemove = []
    for (let i = this.rows.length - 1; i >= 0; --i) {
      if (!newPks.has(this.rows[i].pk)) {
        toRemove.push(this.rows.splice(i, 1)[0])
      }
    }
    toRemove.forEach(row => row.remove())

    // intelligently merge the two row groups, adding only the required
    // keep new order (which might have changed)
    const rows = newRows.map(row => {
      if (currentPks.has(row.pk)) {
        const r = this.rows.find(r => r.pk === row.pk)
        return r.merge(row)
      }
      row.add(this.layer)
      return row
    })

    this.rows = rows

    this.selected.forEach(row => {
      if (!newPks.has(row.internalPk)) {
        this.selected.delete(row.internalPk)
      }
    })
    this.updateSelectedList()
  }

  startEditing () {
    if (this.info.hasGeom && this.map) {
      eachLayer(this.layer, l => l.enableEdit(this.map))
    }
    this.editing = true
  }

  uiEdit (rows) {
    return new Promise(async resolve => {
      const api = await this.$root.$store.dispatch('layout/createDialog', {
        component: DBFormDialog,
        table: this,
        rows
      })
      api.onDismiss(() => resolve())
    })
  }

  uiEditSelected () {
    this.uiEdit(this.visibleSelectedList)
  }

  update ({ pagination, immediate } = {}) {
    if (this.editing) {
      return Promise.reject(new EditingError())
    }

    let requestData
    if (immediate) {
      requestData = this.remote.requestData.bind(this.remote)
    } else {
      requestData = this.remote.debouncedRequestData.bind(this.remote)
    }

    return new Promise((resolve, reject) => {
      requestData(pagination)
        .then(data => {
          if (data) {
            this.setData(data)
            this.select(this.selectedList.filter(pk => typeof pk === 'symbol'), { added: false })
          }
        })
        .then(resolve, reject)
    })
  }

  updateByMap (pagination) {
    if (this.mapDependent) {
      this.update(pagination)
        .catch(Vue.prototype.$except)
    }
  }

  updateSelectedList () {
    Vue.set(this, 'selectedList', Array.from(this.selected))
    Vue.set(this, 'visibleSelectedList', [])
    this.rows.forEach(row => {
      if (this.selected.has(row.internalPk)) {
        this.visibleSelectedList.push(row)
      }
    })
  }

  save () {
    this.saving = true
    if (this.info.hasGeom && this.map) {
      eachLayer(this.layer, l => l.disableEdit(this.map))
    }
    this.remote.save(this.toBulk())
      .then(_ => {
        this.editing = false
        this.rows.forEach(row => row.resetStatus())
        this.update({ immediate: true })
          .catch(Vue.prototype.$except)
      })
      .catch(Vue.prototype.$except)
      .then(() => {
        this.saving = false
      })
  }

  /// Returns the changes done in this table in Giscube Bulk format
  toBulk () {
    const result = {
      ADD: [],
      UPDATE: [],
      DELETE: []
    }
    this.rows.forEach(row => {
      if (row.status.deleted) {
        if (!row.status.new) {
          result.DELETE.push(row.pk)
        }
      } else if (row.status.new) {
        result.ADD.push(row.repr())
      } else if (row.status.edited) {
        result.UPDATE.push(row.diff())
      }
    })
    return result
  }
}
