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
export default {
  props: ['result', 'map'],
  data () {
    return {}
  },
  computed: {
    isResultClickable () {
      return this.result.geojson || this.result.children.length > 0
    }
  },
  methods: {
    viewResult () {
      if (!this.isResultClickable) {
        return
      }

      const layerDescriptor = this.result.children[0]
      const title = this.result.title
      const options = this.result.options || {}
      this.$store.dispatch('map/addLayer', { layerDescriptor, title, options })
    },
    viewResultMain () {
      if (this.isResultClickable) {
        let element = this.result
        // save selected place in store
        this.$store.commit('selectResult', element)
        // then produces the route change
        // FIXME: base this on search used
        if (this.result.geojson) {
          // this.$router.push('/place/' + element.title + '/')
          this.$router.push({ name: 'place', params: { q: element.title } })
        } else {
          this.$router.push('/geoportal/' + element.title + '/')
        }
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
