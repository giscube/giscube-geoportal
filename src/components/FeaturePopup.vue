<template>
  <div class='popup'>
    <div v-if="!renderContents" class='title'>{{ title }}</div>
    <popup-data
      :feature="feature"
      :render-contents="renderContents"
      table-fallback
    ></popup-data>
  </div>
</template>

<script>
import PopupData from './PopupData'

export default {
  props: ['feature', 'title', 'renderContents'],
  components: {
    PopupData
  },
  data () {
    return {
      query: {
        latlng: null
      }
    }
  },
  methods: {
    onOpen ({ target }) {
      this.query.latlng = target.getLatLng()
      this.$store.commit('setQuery', this.query)
    },
    onClose () {
      this.$store.dispatch('removeQuery', this.query)
    }
  }
}
</script>

<style scoped lang="scss">
.popup .title {
  font-size: 1.2em;
  font-weight: bold;
  min-width: 200px;
  margin-bottom: 8px;
}

.layer .title {
  font-size: 1.2em;
  font-weight: bold;
  min-width: 200px;
}

.layer .feature {
  font-weight: bold;
  border-bottom: 3px solid #aaa;
  margin-bottom: 20px;
}

.layer .feature:last-child {
  border-bottom: 0px;
  margin-bottom: 0px;
}

</style>
