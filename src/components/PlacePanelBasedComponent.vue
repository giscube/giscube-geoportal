<template>
  <place-panel>
    <template slot="after-tools">
      Example extra content
    </template>
  </place-panel>
</template>

<script>
import { mapState } from 'vuex'
import PlacePanel from './PlacePanel'
// import { PlacePanel } from '@giscube/geoportal'

export default {
  components: {
    PlacePanel
  },
  computed: {
    ...mapState({
      map: state => state.map.mapObject,
      query: state => state.search.query,
      result: state => state.search.result,
      resultsLayer: state => state.search.resultsLayer
    })
  }
}
</script>
