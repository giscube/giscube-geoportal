<template>
  <div class="panel">

    <div class="panel-content">
      <div class="row items-center justify-end q-mb-md">
        <layers-list
          v-model="layersListOpen"
          :disable="editing"
        />
        <q-space />
        <q-btn
          v-show="layerLoaded && $store.state.dataLayer.geojson && !editing"
          :label="t('edit')"
          @click="$store.dispatch('dataLayer/startEditing')"
        />
        <q-btn-group
          v-show="editing"
        >
          <q-btn
            v-show="!changed && !adding && !saving"
            :label="$t('actions.cancel')"
            @click="$store.dispatch('dataLayer/cancelEdits')"
          />
          <q-btn
            v-show="changed && !adding && !saving"
            :label="$t('actions.discard')"
            @click="onDiscard"
          />
          <q-btn
            v-if="changed && !adding"
            :label="$t('actions.save')"
            :loading="saving || uploading"
            icon="save"
            @click="onSave"
          />
        </q-btn-group>
      </div>
      <div
        v-show="layerLoaded"
        class="row items-center justify-end data-panel-controls"
      >
        <!-- Filters -->
        <div
          v-show="!editing"
          class="row items-center"
        >
          <span>{{ t('filters') }}</span>
          <q-input
            v-model="filter"
            outlined
            dense
            :placeholder="t('findInTable')"
            debounce="500"
          />
          <q-btn
            outline
            no-caps
            color="primary"
            class="toggle"
            :class="{pushed: mapFilter}"
            :label="t('filterByView')"
            @click="mapFilter = !mapFilter"
          />
          <q-btn
            v-show="!adding && !drawing"
            outline
            no-caps
            color="primary"
            class="toggle"
            :class="{pushed: polygonFilter}"
            :label="t('filterByPolygon')"
            @click="onPolygonFilter"
          />
        </div>

        <!-- Edition controls -->
        <div
          v-show="editing"
          class="row items-center"
        >
          <q-btn
            v-show="adding"
            :label="t('stopDrawing')"
            :disable="saving"
            @click="stopDrawing"
          />
          <q-btn-group
            v-show="!adding && !drawing"
          >
            <q-btn
              :label="t('newElement')"
              :disable="saving"
              @click="startDrawing"
            />
            <q-btn
              icon="settings"
              size="xs"
              dense
              class="q-px-sm"
              @click="defaultsDialog = true"
            />
          </q-btn-group>
          <q-btn-dropdown
            v-show="!adding && visibleSelected.length > 0"
            split
            :label="t('editElements', {elements: $tc('names.element', visibleSelected.length, {count: visibleSelected.length})})"
            :disable="saving"
            @click="editSelected"
          >
            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="deleteSelected"
              >
                <q-item-section>
                  <q-item-label>{{ t('deleteElements', {elements: $tc('names.element', visibleSelected.length, {count: visibleSelected.length})}) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <!-- Selection -->
        <q-space />
        <div
          class="row items-center"
        >
          <span>{{ t('selection') }}</span>
          <q-btn
            v-if="!drawing"
            :label="t('selectByPolygon')"
            @click="selectByPolygon"
          />
          <q-btn
            v-else
            :label="t('stopDrawing')"
            @click="$store.dispatch('map/stopDrawing')"
          />
        </div>
      </div>

      <!-- Table with all the data logic -->
      <data-table
        v-show="layerLoaded"
        ref="dataTable"
        class="q-my-md"
        :filter="filter"
        :mapFilter="mapFilter"
        :polygonFilter="polygonFilter"
        @edit="startFeatureEdit"
      />
    </div>

    <!-- popups -->
    <data-form-dialog
      v-if="editing && (editedFeature || editingSelected)"
      :value="true"
      :features="editedFeature ? [editedFeature] : visibleSelected"
      @commit="commitProperties"
      @cancel="cancelPropertiesEdit"
    />

    <new-features
      v-if="layerLoaded"
      ref="newFeatures"
      :defaultProperties="defaultProperties"
      :editMultiple="editMultiple"
      :dialogForNew="dialogForNew"
      :selectNews="selectNews"
    />

    <q-dialog v-model="defaultsDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t('defaultProperties') }}</div>
        </q-card-section>
        <q-card-section class="column q-pa-md">
          <data-form
            :properties="defaultProperties"
            @input="onDefaultPropertiesChange"
            style="width: 50ch; max-width: 100%"
            class="q-mb-md"
          />
          <q-checkbox
            v-model="editMultiple"
            :label="t('multipleNew')"
          />
          <q-checkbox
            v-model="dialogForNew"
            :label="t('dialogNew')"
          />
          <q-checkbox
            v-model="selectNews"
            :label="t('selectNews')"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('actions.accept')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ClosePopup, QBtn, QBtnDropdown, QBtnGroup, QCard, QCardActions, QCardSection, QCheckbox, QDialog, QInput, QItem, QItemLabel, QItemSection, QList, QSpace } from 'quasar'

import DataTable from './DataTable'
import DataForm from './DataForm'
import DataFormDialog from './DataFormDialog'
import LayersList from './LayersList'
import NewFeatures from './NewFeatures'

export default {
  components: {
    DataForm,
    DataFormDialog,
    DataTable,
    QBtn,
    QBtnDropdown,
    QBtnGroup,
    QCard,
    QCardActions,
    QCardSection,
    QCheckbox,
    QDialog,
    QInput,
    QItem,
    QItemLabel,
    QItemSection,
    QList,
    QSpace,
    LayersList,
    NewFeatures
  },
  directives: {
    ClosePopup
  },
  data () {
    return {
      layersListOpen: false,
      filter: '',
      mapFilter: false,
      polygonFilter: null,
      defaultsDialog: false,
      defaultProperties: {},
      editMultiple: false,
      selectNews: false,
      dialogForNew: true,
      drawing: false,
      editedFeature: null,
      editingSelected: false
    }
  },
  computed: {
    layerLoaded () {
      return this.$store.getters['dataLayer/layerLoaded']
    },
    fields () {
      return this.$store.state.dataLayer.layerConfig.fields
    },
    editing () {
      return this.$store.getters['dataLayer/editing']
    },
    visibleSelected () {
      return this.$store.getters['dataLayer/visibleSelected']
    },
    changed () {
      return this.$store.getters['dataLayer/changed']
    },
    adding () {
      return this.$store.state.dataLayer.editStatus.adding
    },
    uploading () {
      return this.$store.state.dataLayer.uploadQueue.running
    },
    saving: {
      get () {
        return this.$store.state.dataLayer.editStatus.saving
      },
      set (value) {
        this.$store.commit('dataLayer/saving', value)
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.commit('setCurrentTool', 'data')
      const current = vm.$store.state.dataLayer.current
      if (current) {
        vm.$router.push({
          name: 'data',
          params: {
            sourceName: current.source.name,
            layerName: current.layer.name
          }
        })
      } else {
        vm.selectLayer(to.params.sourceName, to.params.layerName)
      }
    })
  },
  beforeRouteUpdate (to, from, next) {
    if (!this.editing) {
      const current = this.$store.state.dataLayer.current
      const alreadyCurrent = current && current.source.name === to.params.sourceName && current.layer.name === to.params.layerName
      if (!alreadyCurrent) {
        this.selectLayer(to.params.sourceName, to.params.layerName)
      }
      next()
    } else {
      next(false)
    }
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit('setCurrentTool', null)
    next()
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.data.' + key, ...args)
    },
    selectLayer (sourceName, layerName) {
      if (sourceName && layerName) {
        this.$store.dispatch('dataLayer/verifySourcesLoaded')
          .then(_ => {
            this.$store.dispatch('dataLayer/selectLayer', { sourceName, layerName })
          })
      } else {
        this.layersListOpen = true
        this.$store.commit('dataLayer/current', null)
        this.$store.dispatch('dataLayer/verifySourcesLoaded')
      }
    },
    onPolygonFilter () {
      if (!this.polygonFilter) {
        this.filterByPolygon()
      } else {
        this.removeGeomFilter()
      }
    },
    filterByPolygon () {
      this.$store.dispatch('map/disableDoubleClickZoom')
      this.drawing = true

      const stopDrawing = () => {
        this.drawing = false
        this.$store.dispatch('map/enableDoubleClickZoom')
      }
      this.$store.dispatch('dataLayer/filterByPolygon')
        .then(polygon => {
          this.polygonFilter = polygon
          stopDrawing()
        })
        .catch(stopDrawing)
    },
    removeGeomFilter () {
      if (this.polygonFilter) {
        this.polygonFilter = null
      }
    },
    selectByPolygon () {
      this.$store.dispatch('map/disableDoubleClickZoom')
      this.drawing = true
      const stopDrawing = () => {
        this.drawing = false
        this.$store.dispatch('map/enableDoubleClickZoom')
      }
      this.$store.dispatch('dataLayer/selectByPolygon')
        .then(stopDrawing, stopDrawing)
    },
    startDrawing () {
      this.$refs.newFeatures.start()
    },
    stopDrawing () {
      this.$refs.newFeatures.end()
    },
    editSelected () {
      this.editingSelected = true
    },
    deleteSelected () {
      const undelete = this.visibleSelected.every(feature => feature.status.deleted)
      this.visibleSelected.forEach(feature => { feature.status.deleted = !undelete })
    },
    onDefaultPropertiesChange (properties) {
      this.defaultProperties = properties
    },
    startFeatureEdit (feature) {
      this.editedFeature = feature
    },
    cancelPropertiesEdit () {
      this.editedFeature = null
      this.editingSelected = false
    },
    commitProperties (properties) {
      if (this.editedFeature) {
        this.$store.dispatch('dataLayer/editProperties', { feature: this.editedFeature, properties })
      } else {
        this.$store.dispatch('dataLayer/editMultiple', { features: this.visibleSelected, properties })
      }
      this.editedFeature = null
      this.editingSelected = false
    },
    onDiscard () {
      this.$q.dialog({
        message: this.t('qDiscardChanges'),
        ok: {
          flat: true,
          label: this.$t('yes')
        },
        cancel: {
          flat: true,
          label: this.$t('no')
        },
        persistent: true
      }).onOk(_ => {
        this.$store.dispatch('dataLayer/cancelEdits')
      })
    },
    onSave () {
      this.saving = true
      this.$store.dispatch('dataLayer/saveEdits')
        .then(_ => {
          this.$refs.dataTable.refreshDataNow()
        })
        .catch(this.$except)
        .then(_ => {
          this.saving = false
        })
    }
  }
}
</script>

<style lang="stylus">
@import '~quasar-variables'

.q-btn.pushed
  background-color $primary !important
  border-color $primary !important
  color white !important

.data-panel-controls > div
  margin-bottom: $spaces.sm.y
  &:not(:last-child)
    margin-right: $spaces.sm.x
  & > *:not(:last-child)
    margin-right: $spaces.sm.x
</style>
