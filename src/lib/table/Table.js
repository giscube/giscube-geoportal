import { filter, map } from 'src/lib/itertools'
import except from 'src/lib/except'
import L from 'src/lib/leaflet'
import { CancelError, eachLayer, layersBounds } from 'src/lib/geomUtils'
import { rowsInGeom } from 'src/lib/layersInGeom'
import { split } from 'src/lib/utils'
import Vue from 'vue'

import DBFormDialog from 'components/data-layer/DBFormDialog'

import Popup from './Popup'
import PopupDialog from './PopupDialog'
import RelatedTable from './RelatedTable'
import Remote from './Remote'
import * as Row from './row'
import RowChanges from './RowChanges'
import SaveJob from './SaveJob'

export class EditingError extends Error {
  constructor () {
    super('The action couldn\'t be performed because the table is being edited')
    this.error = 'EditingError'
  }
}

// const tileSize = Math.pow(2, Math.round(Math.log2(Math.max(document.documentElement.clientWidth, document.documentElement.clientHeight) / 2.5)))
const tileSize = 256

export default class Table {
  constructor (source, layer, root, contantFields, loadRelated = true) {
    const getConfig = () => root.$store.getters['auth/config']
    this.remote = new Remote(source, layer, getConfig, contantFields)
    this.info = null
    this.rows = []
    this.transients = new Set()
    this.selected = new Set() /// selected rows' pks
    this.selectedList = [] // Vue won't support sets (until vue 3.0). Convert it manually
    this.visibleSelectedList = []
    this.changedCount = 0
    this.loadRelated = loadRelated

    this.defaultRow = null
    this.defaultRowOptions = {
      editMultiple: false,
      dialogForNew: true,
      selectNews: false
    }

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
    this.updateWmsRequested = false
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
    if (this.info.hasGeom && !this.info.readonlyGeom && this.map) {
      this.rows.forEach(row => row.removeEditEvents())
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

    if (this.loadRelated) {
      this.relatedTables = info.fks.map(fk => new RelatedTable(this, fk))
      await Promise.all(this.relatedTables.map(table => table.fetchInfo()))
      info.setup(this.relatedTables)
    } else {
      this.relatedTables = []
    }

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
        const url = info.auth === 'token' ? `${info.url}?access_token=${token}` : info.url
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

  async makeRows ({ map, editMultiple, dialogForNew, selectNews, createGeom }) {
    this.adding = true
    createGeom = createGeom && this.info.hasGeom && !this.info.readonlyGeom
    editMultiple = editMultiple && createGeom
    try {
      const newRows = []
      do {
        let row
        if (createGeom) {
          row = await this.defaultRow.asNew({ map })
        } else {
          row = this.defaultRow.asNew()
        }
        newRows.push(row)
        this.rows.push(row)
        row.addNew()

        if (selectNews) {
          row.status.selected = true
        }
        if (dialogForNew) {
          await row.uiEdit(newRows)
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

  onRemove () {
    this.$root.$store.dispatch('dataLayer/setFilterPolygon', null)
    this.remote.cancelRequests()
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
    const currentPks = new Set(this.rows.map(row => row.internalPk))
    const transientPks = new Set(filter(map(this.transients, row => row.internalPk), pk => pk !== void 0))
    const newRows = Row.toRows(this, data, this.remote.constFields)
    const newPks = new Set(newRows.map(row => row.internalPk))

    // Remove the unused rows
    const toRemove = []
    for (let i = this.rows.length - 1; i >= 0; --i) {
      const row = this.rows[i]
      if (!newPks.has(row.internalPk)) {
        this.rows.splice(i, 1)
        if (row.status.saving) {
          this.addTransient(row)
        } else {
          toRemove.push(row)
        }
      }
    }
    toRemove.forEach(row => row.remove())

    // merge the two row groups, adding only the required
    // keep new order (which might have changed)
    const rows = newRows.map(row => {
      if (currentPks.has(row.internalPk)) {
        const r = this.rows.find(r => r.internalPk === row.internalPk)
        return r.merge(row)
      } else if (transientPks.has(row.internalPk)) {
        for (let r of this.transients) {
          if (r.internalPk === row.internalPk) {
            this.deleteTransient(r)
            return r.merge(row)
          }
        }
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
    this._updateTransients()
  }

  async fillPage () {
    const pagination = this.remote.pagination
    const isLastPage = pagination.page >= Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)
    if (!isLastPage) {
      const newRows = Row.toRows(this, await this.remote.requestData(), this.remote.constFields)
      const currentPks = new Set(this.rows.map(row => row.internalPk))
      const transients = new Map(map(filter(this.transients, row => row.internalPk !== void 0), row => [row.internalPk, row]))

      let toFill = pagination.rowsPerPage - this.rows.length
      for (let i = 0; toFill > 0 && i < newRows.length; ++i) {
        const row = newRows[i]
        if (!currentPks.has(row.internalPk)) {
          const transient = transients.get(row.internalPk)
          if (transient) {
            this.deleteTransient(transient)
            this.rows.push(transient.merge(row))
          } else {
            this.rows.push(row)
          }
          --toFill
        }
      }

      this._updateTransients()
      this.addRows()
    }
  }

  addRows () {
    this.rows.forEach(row => row.add(this.layer))
  }

  startEditing () {
    if (this.info.hasGeom && !this.info.readonlyGeom && this.map) {
      this.rows.forEach(row => row.addEditEvents())
      eachLayer(this.layer, l => l.enableEdit(this.map))
    }
    this.editing = true
  }

  uiEdit (rows, rowSet) {
    return new Promise(async resolve => {
      const api = await this.$root.$store.dispatch('layout/createDialog', {
        root: this.$root,
        component: DBFormDialog,
        table: this,
        rows,
        rowSet: rowSet || this.rows,
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
      this.updateWMS()
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

  updateWMS () {
    this.updateWmsRequested = false
    this.refLayers && this.refLayers.forEach(ref => {
      ref.refresh && ref.layer.setParams({
        _fu: Date.now() // Force update
      }, false)
    })
  }

  updateByMap (pagination) {
    if (this.mapDependent) {
      this.update(pagination)
        .catch(except)
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
    if (this.info.hasGeom && !this.info.readonlyGeom && this.map) {
      this.rows.forEach(row => row.removeEditEvents())
      eachLayer(this.layer, l => l.disableEdit(this.map))
    }

    const rowChanges = new RowChanges(this.rows, this.info)
    const [persistent, transients] = split(this.rows, row => rowChanges.persistentRows.has(row))
    this.rows = persistent
    transients.forEach(row => this.addTransient(row))
    this._updateTransients()

    this.rows.forEach(row => row.resetStatus())
    this.editing = false
    this.updateWmsRequested = true
    this._save(rowChanges)
    this.changedCount = 0
  }

  async saveIndividual (row) {
    const rowChanges = new RowChanges([row], this.info)
    if (rowChanges.persistentRows.size === 0) {
      this.rows = this.rows.filter(r => r !== row)
    } else {
      this.addTransient(row)
      this._updateTransients()
      row.resetStatus()
    }

    this._save(rowChanges)
  }

  _save (rowChanges) {
    for (let row of rowChanges.deletedRows) {
      this.selected.delete(row.pk)
      this.remote.filters.deleted.add(row.pk)
    }
    this.updateSelectedList()
    this.$root.$store.dispatch('dataLayer/asyncSave', new SaveJob(this, rowChanges))
  }

  _updateTransients () {
    this.transients.forEach(row => {
      row.updateSaving()
      if (!row.status.saving) {
        this.deleteTransient(row)
      }
    })
  }

  addTransient (row) {
    this.transients.add(row)
    row.updateTransient()
  }

  deleteTransient (row) {
    this.transients.delete(row)
    row.updateTransient()
  }
}
