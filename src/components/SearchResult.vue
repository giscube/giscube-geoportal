<template>
  <div class="search-result">
    <div :class="{'list-group-item': true, group: result.group }"
         :style="{'cursor': this.resultCursor}"
         @click="viewResultMain()"
      ><div class="title">{{ result.title }}</div>
      <div v-if="properties.address" class="address">
        <q-icon name="home" /> {{ properties.address }}
      </div>
      <div v-if="coordinates" class="coordinates">
        <q-icon name="place" /> GPS: {{ coordinates }}
      </div>
      <div v-for="(child, index) in result.children" :key="index"
           style="padding: 10px 0 5px 0">
        <span style="padding: 5px 8px; background: #ccddee; border-radius: 4px; font-size: 0.8em"
          >{{ child.type }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { QIcon } from 'quasar'

export default {
  props: ['result', 'map', 'resultsLayer'],
  components: {
    QIcon
  },
  data () {
    return {}
  },
  computed: {
    coordinates () {
      if (this.result.latlng) {
        return this.result.latlng.coordinates[0].toFixed(6) + ', ' + this.result.latlng.coordinates[1].toFixed(6)
      } else {
        return null
      }
    },
    properties () {
      if (this.result.geojson) {
        return this.result.geojson.properties
      } else {
        return {}
      }
    },
    isResultClickable () {
      return this.result.geojson || this.result.children.length > 0
    },
    resultCursor () {
      if (this.isResultClickable) {
        return 'pointer'
      } else {
        return ''
      }
    }
  },
  methods: {
    viewResultMain () {
      if (this.isResultClickable) {
        let element = this.result
        // save selected place in store
        this.$store.commit('selectResult', element)
        // then produces the route change
        // FIXME: base this on search used
        if (this.result.geojson) {
          this.$router.push('/place/' + element.title + '/')
        } else {
          this.$router.push('/geoportal/' + element.title + '/')
        }
      }
    }
  }
}
</script>

<style lang="scss">
.search-result {
  cursor: pointer;

  .title {
    font-weight: 500;
  }
  .address, .coordinates {
    font-style: italic;
    color: #444;
  }
}
</style>
