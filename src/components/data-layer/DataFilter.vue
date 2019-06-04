<template>
  <div
    v-show="!editing"
    class="row items-center"
  >
    <span class="q-mr-md">{{ t('filters') }}</span>
    <q-input
      v-model="filter"
      class="q-mr-sm"
      outlined
      dense
      :placeholder="t('findInTable')"
      debounce="500"
    />
    <q-btn
      v-if="table.info.hasGeom"
      outline
      no-caps
      color="primary"
      class="q-mr-sm toggle"
      :class="{ pushed: mapFilter }"
      :label="t('filterByView')"
      @click="mapFilter = !mapFilter"
    />
    <q-btn
      v-if="table.info.hasGeom"
      outline
      no-caps
      color="primary"
      class="q-mr-sm toggle"
      :class="{ pushed: polygonFilter }"
      :label="t('filterByPolygon')"
      @click="onPolygonFilter"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import { QBtn, QInput } from 'quasar'
import { CancelError } from 'src/lib/utils'

import TranslationMixin from './TranslationMixin'

export default {
  mixins: [TranslationMixin],
  props: ['table'],
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
      if (this.polygonFilter) {
        this.table.remote.setPolygonFilter(null)
      } else {
        this.$store.dispatch('map/draw', 'polygon')
          .then(layer => {
            this.table.remote.setPolygonFilter(layer)
          })
          .catch(e => {
            if (!(e instanceof CancelError)) {
              this.$except(e)
            }
          })
      }
    }
  }
}
</script>
