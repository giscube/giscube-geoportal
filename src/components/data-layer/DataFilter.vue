<template>
  <div
    v-show="!editing"
    class="row items-center space-items-xs"
  >
    <div class="row no-wrap items-center">
      <span class="q-mr-xs">{{ t('filters') }}</span>
      <q-input
        autogrow
        v-model="filter"
        outlined
        dense
        :placeholder="t('findInTable')"
        debounce="500"
      />
      <q-btn
        flat
        round
        size="sm"
        color="primary"
        icon="info"
      >
        <q-tooltip> {{ getAdvancedInfo }} </q-tooltip>
      </q-btn>
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
import { QBtn, QInput, QTooltip } from 'quasar'

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
  components: {
    QBtn,
    QInput,
    QTooltip
  },
  data () {
    return {
      getAdvancedInfo: '"field" + COMP + "value"'
    }
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
  methods: {
    onPolygonFilter () {
      this.$store.dispatch('dataLayer/toggleFilterPolygon')
    }
  }
}
</script>
