<template>
  <div class='measures-list-container'>
    <div v-for='(measure, key) in measures' class='measure'>
      <div>
        <a @click="removeMeasure(key, measure)" class="flex-icon flex-shrink link"
           ><icon name="trash-o" label="configure"></icon></a>
        <span v-if="!measure.measure.area" class='title'>{{ measure.measure.length }} {{ measure.measure.units_desc }}</span>
        <span v-if="measure.measure.area" class='title'>{{ measure.measure.area }} {{ measure.measure.units_desc }}<sup>2</sup></span>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'

export default {
  components: {
    Icon
  },
  data () {
    return {
      measures: []
    }
  },
  methods: {
    removeMeasure (index, measure) {
      this.measures.splice(index, 1)
      this.$emit('remove-measure', measure)
    }
  }
}
</script>

<style lang="scss">


</style>
