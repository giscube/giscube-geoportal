<template>
  <div class="data-panel panel-content fit column no-wrap">
    <div class="row items-center justify-end">
      <layers-list
        v-model="layersListOpen"
        :disable="editing"
        @close="closeTable"
      />
      <q-space />
      <status-controls v-if="table && table.info" :table="table" />
    </div>
    <div class="row items-center space-items-sm" v-if="table && table.info">
      <div class="space">
        <draw-controls
          v-if="drawing"
        />
        <data-edit-controls
          v-else-if="editing"
          :table="table"
          allow-geom
        />
        <data-filter
          v-else
          :table="table"
          allow-geom
        />
      </div>
      <zoom-controls
        :table="table"
      />
      <selection-controls
        :table="table"
        allow-geom
      />
    </div>
    <data-table
      class="col full-width limit-parent"
      v-if="table && table.info"
      :table="table"
    />
  </div>
</template>

<script>
import { QSpace } from 'quasar'
import { mapState } from 'vuex'
import { isCleanEqual } from 'src/lib/utils'
import { Table } from 'src/lib/table'

import TranslationMixin from './TranslationMixin'
import DataEditControls from './DataEditControls'
import DataFilter from './DataFilter'
import DataTable from './DataTable'
import DrawControls from './DrawControls'
import LayersList from './LayersList'
import SaveFeedback from './SaveFeedback'
import SelectionControls from './SelectionControls'
import StatusControls from './StatusControls'
import ZoomControls from './ZoomControls'

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
    ZoomControls,
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
    if (isCleanEqual(from.params, to.params)) {
      next()
      return
    }

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
  created () {
    this.saveFeedback = new SaveFeedback(this)
  },
  data () {
    return {
      layersListOpen: false,
      savedTimout: null
    }
  },
  computed: {
    ...mapState({
      table: state => state.dataLayer.table,
      drawing: state => state.map.drawing,
      saving: state => state.dataLayer.asyncQueue.running
    }),
    editing () {
      return this.table && this.table.editing
    },
    dataChanged () {
      return this.table && this.table.changedCount > 0
    }
  },
  watch: {
    saving (...args) {
      this.saveFeedback.handler(...args)
    }
  },
  methods: {
    checkLeaving () {
      if (this.dataChanged) {
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
    },
    closeTable () {
      this.$store.commit('dataLayer/table', null)
      this.$router.push({ name: 'data', params: {} })
    }
  }
}
</script>

<style lang="stylus">
.data-panel.panel-content > :not(:last-child)
  margin-bottom: $spaces.md.y

</style>
