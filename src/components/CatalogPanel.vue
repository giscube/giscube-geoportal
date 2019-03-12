<template>
  <div class="panel">
    <div class="panel-content">
      <p class="panel-title">Catalog</p>

      <div class="categories">
        <q-list>
          <q-expansion-item v-for="category in categories"
            v-show="category.parent === null"
            :key="category.id"
            :label="category.name"
          >
            <q-expansion-item v-for="subcategory in category.subcategories"
              :key="subcategory.id"
              :header-inset-level="0.5"
              :content-inset-level="1"
              @show="subcategoryChange(subcategory)"
            >
              <template v-slot:header>
                <q-item-section>
                  {{ subcategory.name }}
                </q-item-section>
                <q-item-section side>
                  <q-spinner v-if="subcategory.loading" />
                </q-item-section>
              </template>

              <div>
                <p v-if="subcategory.loading || subcategory.results === undefined">&nbsp;</p>
                <p v-else-if="subcategory.results.length === 0">Empty</p>
                <catalog-result
                  v-else
                  v-for="(result, index) in subcategory.results"
                  :key="index"
                  :result="result"
                  :map="map"
                />
              </div>
            </q-expansion-item>
          </q-expansion-item>
        </q-list>
      </div>

    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'

import CatalogResult from './CatalogResult.vue'

export default {
  components: {
    CatalogResult
  },
  props: ['map'],
  data () {
    return {
      q: '',
      categories: []
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.q = to.params.q
      vm.checkCategories()
    })
  },
  beforeRouteUpdate (to, from, next) {
    let vm = this
    vm.q = to.params.q
    vm.checkCategories()
    next()
  },
  methods: {
    checkCategories () {
      let apiUrl = this.$store.config.catalog.categories
      axios.get(apiUrl)
        .then(response => {
          Vue.set(this, 'categories', response.data)
          this.categories.forEach(category => {
            if (category.parent == null) {
              category.subcategories = this.getSubcategories(category.id)
            }
          })
        })
        .catch(error => {
          console.log(error)
          this.searchError = true
        })
    },
    getSubcategories (id) {
      return this.categories.filter(category => {
        return category.parent === id
      })
    },
    getSubcategoriesResults (category) {
      let api = this.$store.config.catalog.search
      let apiUrl = api + '?category_id=' + category.id
      axios.get(apiUrl)
        .then(response => {
          Vue.delete(category, 'loading')
          Vue.set(category, 'results', response.data.results)
        })
        .catch(error => {
          Vue.delete(category, 'loading')
          console.log(error)
        })
    },
    subcategoryChange (category) {
      if (category.results === undefined) {
        Vue.set(category, 'loading', true)
        this.getSubcategoriesResults(category)
      }
    }
  }
}
</script>
