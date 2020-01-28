import L from 'src/lib/leaflet'
import { CancelError, eachLayer, layersBounds } from 'src/lib/geomUtils'
import { rowsInGeom } from 'src/lib/layersInGeom'
import Vue from 'vue'

import DBFormDialog from 'components/data-layer/DBFormDialog'

import Popup from './Popup'
import PopupDialog from './PopupDialog'
import RelatedTable from './RelatedTable'
import Remote from './Remote'
import * as Row from './row'
import RowChanges from './RowChanges'

export class EditingError extends Error {
  constructor () {
    super('The action couldn\'t be performed because the table is being edited')
    this.error = 'EditingError'
  }
}

// const tileSize = Math.pow(2, Math.round(Math.log2(Math.max(document.documentElement.clientWidth, document.documentElement.clientHeight) / 2.5)))
const tileSize = 256

export default class Table {
  constructor (source, layer, root, contantFields) {
    const getConfig = () => root.$store.getters['auth/config']
    this.remote = new Remote(source, layer, getConfig, contantFields)
    this.info = null
    this.rows = []
    this.selected = new Set() /// selected rows' pks
    this.selectedList = [] // Vue won't support sets (until vue 3.0). Convert it manually
    this.visibleSelectedList = []
    this.changedCount = 0

    this.defaultRow = null

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
    this.updateDeferred = false
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
    const PopupClass = this.$root.$q.platform.is.mobile ? PopupDialog : Popup
    return this._popup || (this._popup = new PopupClass(this.$root))
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
    if (this.refLayers) {
      this.refLayers.forEach(info => {
        this.$root.$store.dispatch('map/addOverlay', {
          layer: info.layer,
          name: info.title
        })
      })
    }
  }

  _discardChanges () {
    if (this.changedCount === 0) {
      return
    }

    for (let i = this.rows.length - 1; i >= 0; --i) {
      const r = this.rows[i]
      if (r.status.new) {
        r.remove()
        this.rows.splice(i, 1)
        this.selected.delete(r.internalPk)
      } else {
        r.revert()
        r.status._deleted = false
        r.applyStyle()
      }
    }
    this.changedCount = 0
    this.updateSelectedList()
  }

  discard () {
    this.editing = false
    if (this.info.hasGeom && this.map) {
      eachLayer(this.layer, l => l.disableEdit(this.map))
    }

    this._discardChanges()

    if (this.updateDeferred) {
      this.update()
    }
  }

  deferUpdate () {
    this.updateDeferred = true
  }

  deleteSelected () {
    const selectedRows = this.visibleSelectedList
    const del = !selectedRows.every(row => row.status.deleted)
    selectedRows.forEach(row => {
      row.status.deleted = del
      row.applyStyle()
    })
  }

  async fetchInfo () {
    const info = await this.remote.fetchInfo()
    this.info = info

    this.relatedTables = info.fks.map(fk => new RelatedTable(this, fk))
    await Promise.all(this.relatedTables.map(table => table.fetchInfo()))
    info.setup(this.relatedTables)

    if (info.hasGeom) {
      this.removeLayers()
      Object.defineProperty(this, 'layer', {
        configurable: true,
        enumerable: false,
        writable: false,
        value: L.featureGroup()
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
          title: info.title,
          refresh: info.refresh
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

    this.defaultRow = this.newRow()

    return info
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

  async makeRows ({ map, editMultiple, dialogForNew, selectNews }) {
    this.adding = true
    editMultiple = editMultiple && this.info.hasGeom
    try {
      do {
        const row = await this.defaultRow.asNew({ map })
        this.rows.push(row)
        row.addNew()

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
    if (!this.map) {
      return
    }

    if (this.layer) {
      this.layer.remove()
    }

    if (this.refLayers) {
      this.refLayers.forEach(info => {
        this.$root.$store.dispatch('map/removeOverlayByLayer', info.layer)
      })
    }
  }

  revertSelected () {
    this.visibleSelectedList.forEach(row => row.status.edited && row.revert())
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
      this.rows = Row.toRows(this, data)
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
      return row
    })

    this.rows = rows
    this.changedCount = 0

    this.selected.forEach(row => {
      if (!newPks.has(row.internalPk)) {
        this.selected.delete(row.internalPk)
      }
    })
    this.updateSelectedList()
  }

  addRows () {
    this.rows.forEach(row => row.add(this.layer))
  }

  startEditing () {
    if (this.info.hasGeom && !this.info.readonlyGeom && this.map) {
      eachLayer(this.layer, l => l.enableEdit(this.map))
    }
    this.editing = true
  }

  uiEdit (rows) {
    return new Promise(async resolve => {
      const api = await this.$root.$store.dispatch('layout/createDialog', {
        component: DBFormDialog,
        table: this,
        rows,
        readonly: !this.editing
      })
      api.onDismiss(() => resolve())
    })
  }

  uiEditSelected () {
    this.uiEdit(this.visibleSelectedList)
  }

  async update ({ pagination, immediate, wms } = {}) {
    let requestData
    if (immediate) {
      requestData = this.remote.requestData.bind(this.remote)
    } else {
      requestData = this.remote.debouncedRequestData.bind(this.remote)
    }

    if (wms) {
      this.refLayers && this.refLayers.forEach(ref => {
        ref.refresh && ref.layer.setParams({
          _fu: Date.now() // Force update
        }, false)
      })
    }

    this.updateDeferred = false

    const data = await requestData(pagination)

    if (data) {
      this.setData(data)
      await Promise.all(this.relatedTables.map(table => table.update()))
      this.addRows()
      this.select(this.selectedList.filter(pk => typeof pk === 'symbol'), { added: false })
    }
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

  async save () {
    if (this.info.hasGeom && this.map) {
      eachLayer(this.layer, l => l.disableEdit(this.map))
    }

    const rowChanges = new RowChanges(this.rows, this.info)
    this.rows = rowChanges.persistentRows

    this.rows.forEach(row => row.resetStatus())
    this.editing = false

    const saveJob = rowChanges.asSaveJob(this.remote)
    this.$root.$store.dispatch('dataLayer/asyncSave', saveJob)
    try {
      await saveJob.asPromise()
      await this.update({ immediate: true, wms: true })
    } catch (e) {
      Vue.prototype.$except(e)
    }
  }
}
