<template>
  <q-input
    ref="search_input"
    class="q-ma-sm search-bar"
    v-model="q"
    autofocus
    square
    outlined
    hide-bottom-space
    bg-color="white"
    :placeholder="t('search') | capitalize"
    @keyup.enter="onSearch"
  >
    <template v-slot:append>
      <q-btn
        flat
        class="full-height"
        icon="search"
        @click="onSearch"
      />
    </template>
  </q-input>
</template>

<script>
import { QBtn, QInput } from 'quasar'

export default {
  props: {
    query: {
      type: String,
      default: ''
    }
  },
  components: {
    QBtn,
    QInput
  },
  data () {
    return {
      q: this.query
    }
  },
  watch: {
    query (value) {
      this.q = value
    }
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.search.' + key, ...args)
    },
    onSearch () {
      if (this.q) {
        this.$store.dispatch('search/search', { query: this.q, forceRefresh: true })
        if (this.$route.params.q !== this.q) {
          this.$router.push({ name: 'search', params: { q: this.q } })
        }
      }
    },
    onSearchType (event) {
      if (event.keyCode === 13) {
        this.onSearch()
      }
    }
  }
}
</script>

<style>
.search-bar .q-field__control {
  padding-right: 0;
}
</style>
