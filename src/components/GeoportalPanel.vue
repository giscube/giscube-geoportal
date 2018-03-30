<template>
  <div class="panel">
    <p class="panel-title">{{ result.title }}</p>

    <div v-if="result">
      {{ properties.adreca }}
    </div>

    <div v-if="result">
      {{ result.description }}
    </div>

    <div class="action">
      <a @click="zoomResult()">
        <span class="oi oi-zoom-in"></span>
        Zoom to data</a>
    </div>

    <div class="action">
      <a @click="viewResult()">
        <span class="oi oi-eye"></span>
        Add to map</a>
    </div>

    <div class="keywords">
      <div class="keywords-title">Keywords</div>
      <router-link v-for="keyword in keywords_items"
        :to="{name: 'search', params: {q: keyword}}" :key="keyword"
        class="keyword">{{ keyword }}</router-link>
    </div>

    <!-- <div v-for="(child, index) in result.children" :key="index"
         style="padding: 10px 0 5px 0">
      <span style="padding: 5px 8px; background: #ccddee; border-radius: 4px; font-size: 0.8em"
        >{{ child.type }}</span>
    </div> -->
  </div>
</template>

<script>
import L from 'leaflet'

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
        console.log('Result is not clickable')
        return
      }

      let map = this.map
      let element = this.result.children[0]

      if (element.type === 'WMS') {
        var wms = L.tileLayer.wms(element.url, {
          layers: element.layers,
          format: 'image/png',
          transparent: true,
          maxZoom: 22
        }).addTo(map)
        map.layerswitcher.addOverlay(wms, this.result.title)
      } else if (element.type === 'TMS') {
        var tms = L.tileLayer(element.url, {
          transparent: true,
          maxZoom: 22
        }).addTo(map)
        map.layerswitcher.addOverlay(tms, this.result.title)
      }
    },
    zoomResult () {
      // FIXME: check visible, fly
      console.log('wms bounds missing')
      this.map.flyTo(new L.LatLng(41.973, 2.775), 14)
    }
  }
}
</script>

<style scoped>
.panel {
    padding: 0 20px 15px 20px;
}
.panel-title {
  font-size: 1.5em;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  margin-bottom: 10px;
}
div.action {
  cursor: pointer;
  line-height: 1.5em;
  display: inline-block;
  padding: 10px;
}
.keywords-title {
  font-size: 1.2em;
  font-weight: 400;
  margin: 10px 0 5px 0;
}
.keywords a {
  display: inline-block;
  padding: 5px 10px;
  margin: 5px 10px;
  border-radius: 5px;
  color: #0a1923;
  background-color: #a1d7f5;
}
</style>
