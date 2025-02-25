<template>
  <div
    v-show="!editing"
    class="items-center space-items-xs"
  >
    <q-input
      class="col"
      v-model="filter"
      outlined
      dense
      :placeholder="t('findInTable')"
      debounce="500"
    >
      <template v-slot:append>
        <q-icon name="close" @click="filter = ''" class="cursor-pointer"></q-icon>
      </template>
      <template v-slot:after>
        <q-btn
          flat
          round
          icon="functions"
          @click="showAdvancedSearchPanel = true"
        >
          <q-tooltip> {{ $t('tools.search.queryBuilder.title') }} </q-tooltip>
          <query-builder-dialog
            :fields="fields"
            :values="filterValues"
            :advancedOption.sync="advancedOption"
            :show.sync="showAdvancedSearchPanel"
            @get-field-values="getFieldValues"
          />
        </q-btn>
      </template>
    </q-input>
    <div>
      <q-btn
        v-if="allowGeom && table.info.hasGeom"
        outline
        no-caps
        color="primary"
        class="toggle q-mr-xs"
        :class="{ pushed: mapFilter }"
        :label="t('filterByView')"
        @click="mapFilter = !mapFilter"
      />
      <q-btn
        v-if="allowGeom && table.info.hasGeom"
        outline
        no-caps
        color="primary"
        class="toggle"
        :class="{ pushed: polygonFilter }"
        :label="t('filterByPolygon')"
        @click="onPolygonFilter"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { QBtn, QIcon, QInput, QTooltip } from 'quasar'

import QueryBuilderDialog from './QueryBuilderDialog'
import TranslationMixin from './TranslationMixin'

export default {
  mixins: [TranslationMixin],
  props: {
    table: Object,
    allowGeom: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      advancedOption: null,
      showAdvancedSearchPanel: false,
      filterValues: []
    }
  },
  components: {
    QBtn,
    QIcon,
    QInput,
    QTooltip,
    QueryBuilderDialog
  },
  computed: {
    editing () {
      return this.table.editing
    },
    filter: {
      get () {
        return this.table.remote.filters.general || ''
      },
      set (value) {
        this.table.remote.filters.general = value
      }
    },
    polygonFilter () {
      return !!this.table.remote.filters.polygon
    },
    mapFilter: {
      get () {
        return this.table.remote.filters.bbox !== null
      },
      set (value) {
        if (value) {
          Vue.set(this.table.remote.filters, 'bbox', this.$store.getters['map/drfgBbox'])
        } else {
          Vue.set(this.table.remote.filters, 'bbox', null)
        }
      }
    },
    fields () {
      return this.table?.info?.tableFields
    }
  },
  watch: {
    advancedOption: {
      handler: 'updateFilters',
      immediate: true
    }
  },
  methods: {
    onPolygonFilter () {
      this.$store.dispatch('dataLayer/toggleFilterPolygon')
    },
    updateFilters () {
      this.filter = this.advancedOption
    },
    getFieldValues (field) {
      if (field?.name) {
        this.filterValues = [...new Set(
          this.table.rows.map(row => {
            if (row.properties[field.name]) {
              return row.properties[field.name]
            }
          })
        )].sort()
      } else {
        this.filterValues = []
      }
    }
  }
}
</script>
