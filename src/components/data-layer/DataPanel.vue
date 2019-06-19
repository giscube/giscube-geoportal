<template>
  <div class="panel fit">
    <div class="panel-content fit column">
      <div class="col-auto row items-center justify-end q-mb-md">
        <layers-list
          v-model="layersListOpen"
          :disable="editing"
        />
        <q-space />
        <status-controls v-if="table && table.info" :table="table" />
      </div>
      <div class="col-auto row items-center justify-end q-mb-md" v-if="table && table.info">
        <draw-controls
          v-if="drawing"
          :disable="saving"
        />
        <data-edit-controls
          v-else-if="editing"
          :table="table"
        />
        <data-filter
          v-else
          :table="table"
        />
        <q-space />
        <selection-controls
          :table="table"
        />
      </div>
      <div class="col full-width" v-if="table">
        <data-table
          class="limit-parent"
          v-if="table.info"
          :table="table"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { QSpace } from 'quasar'
import { mapState } from 'vuex'

import TranslationMixin from './TranslationMixin'
import DataEditControls from './DataEditControls'
import DataFilter from './DataFilter'
import DataTable from './DataTable'
import DrawControls from './DrawControls'
import LayersList from './LayersList'
import SelectionControls from './SelectionControls'
import StatusControls from './StatusControls'

import Table from 'src/lib/table'

export default {
  mixins: [TranslationMixin],
  components: {
    DataEditControls,
    DataFilter,
    DataTable,
    DrawControls,
    LayersList,
    SelectionControls,
    StatusControls,
    QSpace
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.commit('setCurrentTool', 'data')
      const redirect = vm.checkRoute(to)
      if (redirect !== void 0) {
        vm.$router.push(redirect)
      }
    })
  },
  async beforeRouteUpdate (to, from, next) {
    const { sourceName, layerName } = from.params
    const nameOnly = this.table && !sourceName && !layerName
    const leaving = nameOnly || await this.checkLeaving()
    next(leaving && this.checkRoute(to))
  },
  async beforeRouteLeave (to, from, next) {
    const leaving = await this.checkLeaving()
    if (leaving) {
      this.$store.commit('setCurrentTool', null)
      next()
    } else {
      next(false)
    }
  },
  data () {
    return {
      layersListOpen: false
    }
  },
  computed: {
    ...mapState({
      table: state => state.dataLayer.table,
      drawing: state => state.map.drawing
    }),
    editing () {
      return this.table && this.table.editing
    },
    saving () {
      return this.table && this.table.saving
    },
    dataChanged () {
      return this.table && this.table.rows.some(row => row.status.new || row.status.edited || row.status.deleted)
    }
  },
  methods: {
    checkLeaving () {
      if (this.saving) {
        return Promise.resolve(false)
      } else if (this.dataChanged) {
        return new Promise(resolve => {
          this.$q.dialog({
            title: this.t('changedLeaveTitle'),
            message: this.t('changedLeaveMsg'),
            ok: {
              flat: true
            },
            persistent: true
          }).onDismiss(() => {
            resolve(true)
          })
        })
      } else {
        return Promise.resolve(true)
      }
    },
    checkRoute (to) {
      const sourcesPromise = this.$store.dispatch('dataLayer/verifySourcesLoaded')
      sourcesPromise.catch(this.$except)

      const { sourceName, layerName } = to.params

      if (this.table && (!sourceName || !layerName)) {
        const remote = this.table.remote
        return {
          name: 'data',
          params: {
            sourceName: remote.source.name,
            layerName: remote.layer.name
          }
        }
      } else if (!sourceName) {
        sourcesPromise.then(_ => {
          this.layersListOpen = true
        })
      } else if (sourceName && !layerName) {
        // if only a single value, remove it
        return {
          name: 'data',
          params: {}
        }
      } else if (!this.table || !this.table.remote.is(to.params)) {
        sourcesPromise.then(sources => {
          const source = sources.find(source => source.name === sourceName) || null
          const layer = source && (source.layers.find(layer => layer.name === layerName) || null)
          const table = layer && this.newTable(source, layer)
          this.$store.commit('dataLayer/table', table)
          if (table) {
            this.loadData()
          } else {
            // TODO notify user
          }
        })
      }
    },
    async loadData () {
      try {
        await this.table.fetchInfo()
        await this.table.update({ immediate: true })
      } catch (e) {
        this.$except(e)
      }
    },
    newTable (source, layer) {
      return new Table(source, layer, this.$root)
    }
  }
}
</script>

<style>
.limit-parent {
  max-width: 100%;
  max-height: 100%;
}
</style>
