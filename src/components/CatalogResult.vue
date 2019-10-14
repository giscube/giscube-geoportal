<template>
  <div>
    <div class="catalog-result"
         @click="viewResultMain">
      <span class="catalog-result-add-to-map"
            @click.stop="viewResult"
            ><q-icon name="layers"></q-icon> {{ $t('actions.addToMap') | capitalize }}</span>
      <span class="catalog-result-title">{{ result.title }}</span>
      <span class="catalog-result-description">{{ result.description }}</span>
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
  methods: {
    viewResult () {
      const layer = this.result.toLayer(this.$root)
      if (layer) {
        this.$store.dispatch('map/addLayer', layer)
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
  .catalog-result-add-to-map {
    float: right;
    background-color: #eee;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    margin: 0 0 0 10px;

    &:hover {
      background-color: #c9c9c9;
    }
  }
}

</style>
