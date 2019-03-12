<template>
  <div>
    <div :class="{'list-group-item': true, group: result.group }"
         :style="{'cursor': this.resultCursor}"
         @click="viewResultMain()"
      ><div>{{ result.title }}</div>
      <div v-if="properties.adreca" style="font-style: italic"><q-icon name="location_on" /> {{ properties.adreca }}</div>
      <div v-for="(child, index) in result.children" :key="index"
           style="padding: 10px 0 5px 0">
        <span style="padding: 5px 8px; background: #ccddee; border-radius: 4px; font-size: 0.8em"
          >{{ child.type }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['result', 'map', 'resultsLayer'],
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

<style>
</style>
