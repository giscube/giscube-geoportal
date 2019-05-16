<template>
  <div class="panel catalog-panel">
    <div class="panel-content">
      <p class="panel-title">{{ t('title') }}</p>

      <div class="categories">
        <q-list>
          <q-expansion-item v-for="category in categories"
            v-show="category.parent === null"
            :key="category.id"
            :label="category.name"
            @show="categoryChange(category)"
            header-class="category"
          >
            <q-expansion-item v-for="subcategory in category.subcategories"
              :key="subcategory.id"
              @show="subcategoryChange(subcategory)"
              header-class="subcategory"
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
                <div v-else-if="subcategory.results.length === 0" class="catalog-result empty">
                  <q-icon name="ion-information-circle-outline" size="20px" /> {{ $t('tools.catalog.noItems') }}
                </div>
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
import axios from 'axios'
import { QExpansionItem, QIcon, QItemSection, QList, QSpinner } from 'quasar'
import Vue from 'vue'

import CatalogResult from './CatalogResult.vue'

export default {
  props: ['map'],
  components: {
    CatalogResult,
    QExpansionItem,
    QIcon,
    QItemSection,
    QList,
    QSpinner
  },
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
          this.$except(error)
          this.searchError = true
        })
    },
    getSubcategories (id) {
      return this.categories.filter(category => {
        return category.parent === id
      })
    },
    categoryChange (category) {
      category.subcategories.forEach(subcategory => {
        this.subcategoryChange(subcategory)
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
          this.$except(error)
        })
    },
    subcategoryChange (category) {
      if (category.results === undefined) {
        Vue.set(category, 'loading', true)
        this.getSubcategoriesResults(category)
      }
    },
    t (key) {
      return this.$t('tools.catalog.' + key)
    }
  }
}
</script>

<style lang="scss">
.catalog-panel {
  .categories {
    .q-item.category {
      padding-left: 10px;
      font-size: 1.13em;
      font-weight: 500;
      background-color: #dfdfdf;
      border-bottom: 1px solid #ebeef5;

      &:hover {
        background-color: #a1d7f5;
      }
    }
    .q-item.subcategory  {
      padding-left: 20px;
      font-size: 1.05em;
      font-weight: 500;
      background-color: #f5f5f5;
      border-bottom: 1px solid #ebeef5;

      &:hover {
        background-color: #a1d7f5;
      }
    }
    .catalog-result {
      font-size: 0.93em;
      line-height: 1.7em;
    }
    .catalog-result.empty {
      padding-top: 15px;
    }
  }
}
</style>
