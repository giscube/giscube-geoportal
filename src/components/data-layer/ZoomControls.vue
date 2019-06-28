<template>
  <div
    v-show="table.info.hasGeom"
    class="row items-center"
  >
    <q-btn
      :label="$t('actions.zoomToData')"
      @click="zoomData"
    />
    <q-btn
      v-show="table.visibleSelectedList.length > 0"
      class="q-ml-md"
      :label="$t('actions.zoomToSelection')"
      @click="zoomSelected"
    />
  </div>
</template>

<script>
import { QBtn } from 'quasar'
import { mapState } from 'vuex'

export default {
  props: ['table'],
  components: {
    QBtn
  },
  computed: mapState({
    map: state => state.map.mapObject
  }),
  methods: {
    zoomTo (bounds) {
      if (bounds) {
        this.map.flyToBounds(bounds.pad(this.$config.layout.mapZoomPadding), {
          maxZoom: this.$config.layout.mapMaxFlyZoom
        })
      }
    },
    zoomData () {
      this.zoomTo(this.table.getVisibleBounds())
    },
    zoomSelected () {
      this.zoomTo(this.table.getSelectedBounds())
    }
  }
}
</script>
