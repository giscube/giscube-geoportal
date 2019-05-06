<template>
  <div class="panel geoportal-panel">

    <div class="panel-content">

      <p class="panel-title">{{ result.title }}</p>

      <div v-if="result">
        {{ properties.address }}
      </div>

      <div v-if="result" class="description">
        {{ result.description }}
      </div>

      <div class="row reverse">
        <q-btn flat stretch no-caps
          icon="zoom_in"
          :label="$t('actions.zoomToData')"
          @click="zoomResult"
        />

        <q-btn flat stretch no-caps
          icon="layers"
          :label="$t('actions.addToMap') | capitalize"
          @click="viewResult"
        />
      </div>

      <div class="keywords">
        <div class="keywords-title">Keywords</div>
        <q-chip v-for="keyword in keywords_items" :key="keyword"
            clickable square
            @click="$router.push({name: 'search', params: {q: keyword}})"
          >{{ keyword }}</q-chip>
      </div>

    </div>
  </div>
</template>

<script>
import L from '../lib/leaflet'

import BaseResultMixin from './BaseResultMixin.js'

export default {
  mixins: [BaseResultMixin],
  props: ['map'],
  data () {
    return {}
  },
  computed: {
    properties () {
      if (this.result.geojson) {
        return this.result.geojson.properties
      } else {
        return {}
      }
    },
    isResultClickable () {
      return this.result.children.length > 0
    },
    keywords_items () {
      if (this.result.keywords) {
        return this.result.keywords.split(',').map(item => item.trim())
      } else {
        return []
      }
    }
  },
  methods: {
    viewResult () {
      if (!this.isResultClickable) {
        return
      }

      const layerDescriptor = this.result.children[0]
      const title = this.result.title
      const options = this.result.options || {}
      this.$store.dispatch('map/addLayer', { layerDescriptor, title, options })
    },
    zoomResult () {
      // FIXME: check visible, fly
      this.map.flyTo(new L.LatLng(41.973, 2.775), 14)
    }
  }
}
</script>

<style lang="scss">
.geoportal-panel {
  .panel-title {
    margin-bottom: 20px;
  }

  .description {
    margin-bottom: 15px;
  }

  .keywords-title {
    font-size: 1.2em;
    font-weight: 400;
    margin: 20px 0 5px 0;
  }

  .q-chip {
    color: #0a1923;
    background-color: #a1d7f5 !important;
  }
}
</style>
