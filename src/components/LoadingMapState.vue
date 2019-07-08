<template>
  <div
    v-show="loading"
    class="loader"
    :style="{
      left: leftDrawerSize + 'px'
    }"
  >
    <div class="absolute-center" style="width: 20vmin; height: 20vmin">
      <q-spinner size="100%" />
    </div>
  </div>
</template>

<script>
import { QSpinner } from 'quasar'
import { mapGetters } from 'vuex'

export default {
  components: {
    QSpinner
  },
  computed: mapGetters({
    leftDrawerSize: 'layout/leftDrawerVisibleSize',
    loading: 'layout/mapLoading'
  })
}
</script>

<style lang="stylus">
.loader
  position: absolute
  background-color: rgba(0, 0, 0, 0.2)
  top: 0
  bottom: 0
  left: 0
  right: 0
  z-index: 990 // Leaflet controls have z-index 1000
  pointer-events: none // Everything under it continues working
</style>
