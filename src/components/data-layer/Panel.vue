<template>
  <div class="panel">

    <div class="panel-content">
      <div class="row items-center">
        <layers-list
          class="q-mr-md q-mb-md"
          v-model="layersListOpen"
        />
        <q-space />
        <q-btn
          v-show="layerLoaded && $store.state.dataLayer.geojson && !editing"
          class="q-mb-md"
          :label="t('edit')"
          @click="$store.dispatch('dataLayer/startEditing')"
        />
        <q-btn-group
          v-if="editing"
        >
          <q-btn
            v-show="!changed"
            :disable="adding"
            :label="$t('cancel')"
            @click="$store.dispatch('dataLayer/cancelEdits')"
          />
          <q-btn
            v-show="changed"
            :disable="adding"
            :label="$t('discard')"
            @click="onDiscard"
          />
          <q-btn
            v-if="changed"
            :label="$t('save')"
            icon="save"
            :disable="adding || !changed"
            @click="onSave"
          />
        </q-btn-group>
      </div>
      <div
        v-show="layerLoaded && !editing"
        class="row items-center"
      >
        <span>Filters:</span>
        <q-input
          v-model="filter"
          outlined
          dense
          placeholder="Table info"
          debounce="500"
        />
        <q-separator vertical class="q-ma-xs" />
        <q-btn
          outline
          no-caps
          color="primary"
          :class="{pushed: mapFilter, toggle: true}"
          @click="mapFilter = !mapFilter"
        >
          Map
        </q-btn>
        <q-btn
          v-if="!selecting"
          @click="selectByPolygon"
        >
          polygon
        </q-btn>
        <q-btn
          v-else
          @click="cancelPolygonSelection"
        >
          stop drawing
        </q-btn>
      </div>
      <div
        v-show="layerLoaded && editing"
        class="row items-center"
      >
        <q-btn
          v-show="adding"
          :label="t('stopDrawing')"
          @click="stopDrawing"
        />
        <q-btn-dropdown
          v-show="!adding"
          split
          :label="t('newElement')"
          @click="startDrawing"
        >
          <div class="column q-pa-md">
            <div>{{ t('defaultProperties') }}</div>
            <data-form
              :fields="$store.getters['dataLayer/fields']"
              :data="[{ properties: defaultProperties }]"
              @change="defaultProperties = $event"
              style="width: 50ch"
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
          </div>
        </q-btn-dropdown>
        <q-btn-dropdown
          v-show="!adding && visibleSelected.length > 0"
          class="q-mx-md"
          split
          :label="t('editElements', {elements: $tc('element', visibleSelected.length, {count: visibleSelected.length})})"
          @click="editSelected"
        >
        <q-list>
          <q-item
            clickable
            v-close-popup
            @click="deleteSelected"
          >
            <q-item-section>
              <q-item-label>{{ t('deleteElements', {elements: $tc('element', visibleSelected.length, {count: visibleSelected.length})}) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        </q-btn-dropdown>
      </div>

      <!-- Table with all the data logic -->
      <data-table
        v-show="layerLoaded"
        ref="dataTable"
        class="q-my-md"
        :filter="filter"
        :mapFilter="mapFilter"
        @edit="startFeatureEdit"
      />
    </div>

    <!-- popups -->
    <data-form-dialog
      v-if="editing && (editedFeature || editingSelected)"
      :value="true"
      :fields="$store.getters['dataLayer/fields']"
      :data="editedFeature ? [editedFeature] : visibleSelected"
      @commit="commitProperties"
      @cancel="cancelPropertiesEdit"
      @delete="deleteEditedFeature"
    />
    <new-features
      v-if="layerLoaded"
      ref="newFeatures"
      :defaultProperties="defaultProperties"
      :editMultiple="editMultiple"
      :dialogForNew="dialogForNew"
    />
  </div>
</template>

<script>

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
    LayersList,
    NewFeatures
  },
  data () {
    return {
      layersListOpen: false,
      filter: '',
      mapFilter: false,
      defaultProperties: {},
      editMultiple: false,
      dialogForNew: true,
      selecting: false,
      editedFeature: null,
      editingSelected: false
    }
  },
  computed: {
    layerLoaded () {
      return this.$store.getters['dataLayer/layerLoaded']
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
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.selectLayer(to.params.sourceName, to.params.layerName))
  },
  beforeRouteUpdate (to, from, next) {
    if (!this.editing) {
      this.selectLayer(to.params.sourceName, to.params.layerName)
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
      this.$store.commit('setCurrentTool', 'data')
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
    selectByPolygon () {
      this.selecting = true
      const stopSelecting = () => { this.selecting = false }
      this.$store.dispatch('dataLayer/selectByPolygon')
        .then(stopSelecting, stopSelecting)
    },
    cancelPolygonSelection () {
      this.$store.dispatch('map/stopDrawing')
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
    deleteEditedFeature () {
      this.editedFeature.status.deleted = !this.editedFeature.status.deleted
      this.cancelPropertiesEdit()
    },
    onDiscard () {
      this.$q.dialog({
        message: 'Are you sure you want to discard all the changes?',
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
      this.$store.dispatch('dataLayer/saveEdits')
        .then(_ => {
          this.$refs.dataTable.refreshDataNow()
        })
    }
  }
}
</script>

<style>
.q-btn.pushed {
  background-color: var(--q-color-primary) !important;
  border-color: var(--q-color-primary) !important;
  color: white !important;
}
</style>
