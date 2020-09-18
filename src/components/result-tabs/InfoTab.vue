<template>
  <div>
    <div v-if="description" class="description">
      {{ description }}
    </div>

    <div class="legend" v-if="result && legend">
      <p class="panel-subtitle">{{ $t('names.legend') | capitalize }}</p>
      <div v-html="legend"></div>
    </div>

    <div class="keywords" v-if="keywords">
      <div class="panel-subtitle">{{ $t('names.keywords') | capitalize }}</div>
      <q-chip
        v-for="keyword in keywords"
        :key="keyword"
        clickable
        square
        @click="searchKeyword(keyword)"
        v-show="keyword !== ''"
      >
        {{ keyword }}
      </q-chip>
    </div>
  </div>
</template>

<script>
import { QChip } from 'quasar'

export default {
  props: ['description', 'result', 'legend', 'keywords'],
  components: {
    QChip
  },
  methods: {
    searchKeyword (keyword) {
      this.$store.dispatch('search/search', { query: keyword, auto: false })
      this.$router.push({
        name: 'search',
        params: { q: keyword }
      })
    }
  }
}
</script>
