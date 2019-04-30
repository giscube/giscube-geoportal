<template>
  <div class="search-bar">
    <div class="row search-row">

      <input ref="search_input" type="text" class="search-input" :placeholder="t('search')"
        @keyup="onSearchType" :value="q">
      <q-btn flat
        icon="search"
        @click.prevent="onSearch"
      />

    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  computed: {
    q () {
      return this.$store.state.searchQ
    }
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.search.' + key, ...args)
    },
    onSearch () {
      let q = this.$refs.search_input.value
      this.$store.commit('setAutoselectResult', true)
      this.$store.commit('search', q)
      this.$router.push('/search/' + q + (q ? '/' : ''))
      this.$emit('search-start')
    },
    onSearchType (event) {
      if (event.keyCode === 13) {
        this.onSearch()
      }
    }
  }
}
</script>

<style lang="scss">
.search-bar {
  margin: 8px 8px 16px 8px;

  .search-row {
    border: 1px solid #E4E4E4;
    background-color: #fff;
  }

  .search-input {
    padding: 3px 5px 3px 15px;
    line-height: 40px;
    font-size: 1.1em;
    border: 0;
    flex-grow: 1;
  }

  .search-input::placeholder {
    font-weight: 500;
  }

  .q-btn--rectangle {
    border-radius: 0;
  }
}
</style>
