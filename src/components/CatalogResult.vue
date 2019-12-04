<template>
  <div class="row no-wrap catalog-result" @click="viewResultMain">
    <div class="col no-wrap">
      <div class="catalog-result-title">{{ result.title }}</div>
      <div class="catalog-result-description">{{ result.description }}</div>
    </div>
    <q-btn
      v-if="canBePinned"
      flat
      class="add-to-map"
      style="color: initial"
      @click.stop="viewResult"
    >
      <div class="add-to-map-icon">
        <q-icon name="layers" />
        <q-badge color="transparent" dense flat floating style="font-size: 0.6em; right: -1em">
          <q-icon name="add" align="top" color="black" />
        </q-badge>
      </div>
    </q-btn>
  </div>
</template>

<script>
import { QBadge, QBtn, QIcon } from 'quasar'
import { notify } from 'src/lib/notifications'

export default {
  props: ['result'],
  components: {
    QBadge,
    QBtn,
    QIcon
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
    font-size: 0.7em;
    background-color: #eee;
    border-radius: 5px;

    &:hover {
      background-color: #c9c9c9;
    }
  }
  .add-to-map-icon {
    position: relative;
    width: 1em;
    height: 1em;
    width: max-content;
    height: max-content;
    padding: 0.2em;
  }
}

</style>
