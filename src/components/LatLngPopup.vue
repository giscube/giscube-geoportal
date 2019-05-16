<template>
  <div class='popup'>
    <div class='title'>{{ $t('names.lat') | capitalize }}, {{ $t('names.lng') | capitalize }}</div>
    <a @click='onClick'>{{ coords }}</a>
  </div>
</template>

<script>

export default {
  props: ['latlng'],
  data () {
    return {}
  },
  computed: {
    coords () {
      return this.latlng && `${this.latlng.lat.toFixed(6)}, ${this.latlng.lng.toFixed(6)}`
    }
  },
  methods: {
    onClick () {
      this.$store.commit('layout/setSidebarVisible', true)
      this.$router.push({ name: 'coords', params: { epsg: '4326', coords: this.coords } })
    }
  }
}
</script>

<style scoped lang="scss">
.popup a {
  cursor: pointer;
}
.popup .title {
  font-size: 1.2em;
  font-weight: bold;
  min-width: 200px;
  margin-bottom: 8px;
}
</style>
