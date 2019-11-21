<template>
  <div class="search-result">
    <div :class="{'list-group-item': true, group: result.group }"
         :style="{'cursor': this.resultCursor}"
         @click="viewResultMain()"
      ><div class="title">{{ title }}</div>
      <div v-if="subtitle" class="info">
        {{ subtitle }}
      </div>
      <div v-if="catalog" class="info">
        <q-icon :name="$config.tools.catalog.icon" /> {{ catalog }}
      </div>
      <div v-if="address" class="info">
        <q-icon name="home" /> {{ address }}
      </div>
      <div v-if="coordinates" class="info">
        <q-icon name="place" /> GPS: {{ coordinates }}
      </div>
      <!--
      <div v-for="(child, index) in result.children" :key="index"
           style="padding: 10px 0 5px 0">
        <span style="padding: 5px 8px; background: #ccddee; border-radius: 4px; font-size: 0.8em"
          >{{ child.type }}</span>
      </div>
      -->
    </div>
  </div>
</template>

<script>
import { QIcon } from 'quasar'

export default {
  props: ['result'],
  components: {
    QIcon
  },
  data () {
    return {}
  },
  computed: {
    title () {
      if (this.result.coords) {
        return this.$filter('capitalize')(this.$t('names.coords'))
      }
      return this.result.title
    },
    subtitle () {
      return this.result && this.result.subtitle
    },
    address () {
      return (this.result && this.result.address) || (this.properties && this.properties.address)
    },
    catalog () {
      return this.result && this.result.catalog && Array.isArray(this.result.catalog) && this.result.catalog.join(' > ')
    },
    coordinates () {
      if (this.result.coords) {
        return this.result.coords
      } else if (this.result.latlng) {
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
      return this.result.coords || this.result.geojson || (this.result.children && this.result.children.length > 0)
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
        this.$store.dispatch('search/select', { result: this.result })
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
  .info {
    font-style: italic;
    color: #444;
  }
}
</style>
