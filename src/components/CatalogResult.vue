<template>
  <div>
    <div class="catalog-result"
         @click="viewResultMain">
      <span class="catalog-result-add-to-map"
            @click.stop="viewResult"
            ><span class="oi oi-eye"></span> Add to map</span>
      <span class="catalog-result-title">{{ result.title }}</span>
      <span class="catalog-result-description">{{ result.description }}</span>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'

export default {
  props: ['result', 'map'],
  data () {
    return {}
  },
  computed: {
    isResultClickable () {
      return this.result.geojson || this.result.children.length > 0
    }
  },
  methods: {
    addToMap () {
      console.log('Add To Map!!!')
    },
    viewResult () {
      // TODO: refactor
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
    viewResultMain () {
      // TODO: refactor
      if (this.isResultClickable) {
        let element = this.result
        // save selected place in store
        this.$store.commit('selectResult', element)
        // then produces the route change
        // FIXME: base this on search used
        if (this.result.geojson) {
          // this.$router.push('/place/' + element.title + '/')
          this.$router.push({name: 'place', params: {q: element.title}})
        } else {
          this.$router.push('/geoportal/' + element.title + '/')
        }
      }
    }
  }
}
</script>

<style scoped>
.catalog-result {
  cursor: pointer;
  padding: 8px 10px 8px 20px;
  border-bottom: 1px solid #eee;
  min-height: 50px;
}
.catalog-result:hover {
  background-color: #dddddd;
}
.catalog-result-title {
  display: block;
  font-weight: bold;
}
.catalog-result-add-to-map {
  float: right;
  background-color: #eee;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  margin: 0 0 0 10px;
}
.catalog-result-add-to-map:hover {
  background-color: #c9c9c9;
}

</style>
