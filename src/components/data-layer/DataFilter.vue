<template>
  <div
    v-show="!editing"
    class="items-center space-items-xs"
  >
    <div class="no-wrap items-center">
      <q-input
        autogrow
        v-model="filter"
        outlined
        dense
        :placeholder="t('findInTable')"
        debounce="500"
        type="textarea"
      >
        <template v-slot:before>
          <span class="q-mr-xs" style="font-size: 14px; color: black">{{ t('filters') }}</span>
        </template>
        <template v-slot:after>
          <q-btn
            flat
            round
            icon="las la-info-circle"
          >
            <q-tooltip> {{ $t('tools.search.advancedSearchInfo') }} </q-tooltip>
            <q-menu>
              <advanced-search-panel
                :items="operators"
                :advancedOption.sync="advancedOption"
              />
            </q-menu>
          </q-btn>
        </template>
      </q-input>
    </div>
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
import { QBtn, QInput, QTooltip, QMenu } from 'quasar'

import AdvancedSearchPanel from './AdvancedSearchPanel'
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
      operators: [
        '>', '>=', '<', '<=', '=', 'LIKE'
      ]
    }
  },
  components: {
    QBtn,
    QInput,
    QTooltip,
    QMenu,
    AdvancedSearchPanel
  },
  computed: {
    editing () {
      return this.table.editing
    },
    filter: {
      get () {
        return this.table.remote.filters.general
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
      if (this.advancedOption) {
        console.log('advancedOption', this.advancedOption)
        if (this.filter) {
          this.filter += ' ' + this.advancedOption + ' '
        } else {
          this.filter = '"" ' + this.advancedOption + ' ""'
        }
      }
    }
  }
}
</script>
