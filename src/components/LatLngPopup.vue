<template>
  <div class='popup'>
    <div class='title'>{{ $t('names.coords') | capitalize }}</div>
    <div
      v-for="epsg in $config.epsgs"
      :key="epsg.code"
      class="latlng--values row justify-between"
      @click="copyEpsg(projected(epsg))"
      @mouseover="copied = false"
    >
      <div><b :key="epsg.code + '--label'">{{ epsg.label }}:</b></div>
      <div>
        <a :key="epsg.code + '--value'">{{ projectedWithFormat(epsg) }}</a>
        <q-tooltip anchor="bottom middle" self="top middle" off>
          {{ copied ? $t('actions.copiedCoordinates') : $t('actions.copyCoordinates') }}
        </q-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import { projectCoords, formatCoords } from 'src/lib/geomUtils'
import { QTooltip } from 'quasar'

export default {
  props: ['latlng'],
  components: {
    QTooltip
  },
  data () {
    return {
      copied: false
    }
  },
  computed: {
    coords () {
      return this.latlng && `${this.latlng.lat.toFixed(6)}, ${this.latlng.lng.toFixed(6)}`
    }
  },
  methods: {
    onClick () {
      this.$emit('remove-query')
    },
    projected (epsg) {
      return projectCoords(this.latlng, epsg)
    },
    projectedWithFormat (epsg) {
      return formatCoords(this.latlng, epsg)
    },
    copyEpsg (epsg) {
      this.copied = true
      navigator.clipboard.writeText(epsg)
      setTimeout(() => {
        this.copied = false
      }, 3000)
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

.elemento {
  display: flex; /* Activa flexbox */
  gap: 10px;     /* Espacio opcional entre elementos */
}
</style>
