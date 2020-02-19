<template>
  <div class="row no-wrap catalog-result" @click="viewResultMain">
    <div class="col">
      <div class="catalog-result-title">{{ result.title }}</div>
      <div class="catalog-result-description">{{ result.description }}</div>
    </div>
    <q-btn
      v-if="canBePinned"
      flat
      class="add-to-map"
      @click.stop="viewResult"
    >
      <add-layer-icon />
    </q-btn>
  </div>
</template>

<script>
import { QBtn } from 'quasar'
import { notify } from 'src/lib/notifications'
import AddLayerIcon from './AddLayerIcon'

export default {
  props: ['result'],
  components: {
    AddLayerIcon,
    QBtn
  },
  data () {
    return {
      canBePinned: true
    }
  },
  methods: {
    async viewResult () {
      const layer = this.result.toLayer(this.$root)
      if (layer) {
        this.canBePinned = await this.$store.dispatch('map/addLayer', layer)
        if (!this.canBePinned) {
          notify('Cannot pin because it doesn\'t have any geometry', { timout: 1000 })
        }
      }
    },
    viewResultMain () {
      if (this.result.isLayer) {
        this.$store.commit('search/result', this.result)
        this.$router.push({ name: 'place', params: { q: this.result.title } })
      }
    }
  }
}
</script>

<style lang="scss">
.catalog-result {
  cursor: pointer;
  padding: 8px 10px 8px 20px;
  border-bottom: 1px solid #eee;
  min-height: 50px;
  background-color: #fff;

  &:hover {
    background-color: #a1d7f5;
  }

  .catalog-result-title {
    display: block;
    font-weight: bold;
  }
  .add-to-map {
    align-self: center;
    font-size: 1.4em;
    color: initial;
    background-color: #eee;
    border-radius: 5px;

    &:hover {
      background-color: #c9c9c9;
    }
  }
}

</style>
