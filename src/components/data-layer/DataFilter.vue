<template>
  <div
    v-show="!editing"
    class="row items-center space-items-xs"
  >
    <div class="row no-wrap items-center">
      <span class="q-mr-xs">{{ t('filters') }}</span>
      <q-input
      v-model="filter"
      outlined
      dense
      :placeholder="t('findInTable')"
      debounce="500"
      />
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
import { QBtn, QInput } from 'quasar'

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
    QInput
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
