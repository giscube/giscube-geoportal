<template>
<div>
  <span v-for="element in elements" :key="element.label">
    <data-row :element="element" />
  </span>
</div>
</template>

<script>
import DataRow from 'src/components/DataRow.vue'

export default {
  props: ['properties'],
  components: {
    DataRow
  },
  computed: {
    elements () {
      let properties = []
      for (const prop in this.properties) {
        properties.push({
          label: prop,
          value: this.properties[prop]
        })
      }
      return properties
    }
  }
}
</script>

<style>
</style>
