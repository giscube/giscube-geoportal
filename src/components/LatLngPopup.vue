<template>
  <div class='popup'>
    <div class='title'>{{ $t('names.coords') | capitalize }}</div>
    <div class="latlng--values" @click='onClick'>
      <template
        v-for="epsg in $config.epsgs"
      >
        <b :key="epsg.code + '--label'">{{ epsg.label }}:</b>
        <a :key="epsg.code + '--value'">{{ projected(epsg) }}</a>
      </template>
    </div>
  </div>
</template>

<script>
import { formatCoords } from 'src/lib/geomUtils'

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
      this.$store.dispatch('layout/setSidebarVisible', true)
      this.$router.push({ name: 'coords', params: { epsg: '4326', coords: this.coords } })
      this.$emit('remove-query')
    },
    projected (epsg) {
      return formatCoords(this.latlng, epsg)
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

.latlng--values {
  white-space: nowrap;
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: 0.8em;
}
</style>
