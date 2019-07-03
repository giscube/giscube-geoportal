<template>
  <popup-data
    v-if="row"
    :feature="row"
    :fields="fields"
    :render-contents="tooltipTemplate"
  ></popup-data>
</template>

<script>
import PopupData from '../PopupData'

export default {
  props: ['row'],
  components: {
    PopupData
  },
  computed: {
    fields () {
      return this.row.parent.info.fields
    },
    tooltipTemplate () {
      return this.row.parent.info.tooltipTemplate
    }
  }
}
</script>
