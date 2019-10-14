<template>
  <div class="panel catalog-panel">
    <div class="panel-content">
      <p class="panel-title">{{ t('title') }} <q-spinner v-if="loading" /></p>

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
              @show="onShowSubcategory(subcategory)"
              @before-hide="onHideSubcategory(subcategory)"
              header-class="subcategory"
            >
              <template v-slot:header>
                <q-item-section>
                  {{ subcategory.name }}
                </q-item-section>
                <q-item-section side v-show="subcategoriesOpen[subcategory.id]">
                  <q-spinner v-if="subcategory.loading" />
                  <q-btn
                    flat
                    dense
                    size="0.75em"
                    style="color: initial"
                    icon="layers"
                    :label="$t('actions.addToMap') | capitalize"
                    :disable="subcategory.loading"
                    @click.stop="addAll(subcategory)"
                  />
                </q-item-section>
              </template>

              <div>
                <q-spinner v-if="subcategory.loading" />
                <p v-else-if="subcategory.results === undefined">&nbsp;</p>
                <div v-else-if="subcategory.results.length === 0" class="catalog-result empty">
                  <q-icon name="ion-information-circle-outline" size="20px" /> {{ $t('tools.catalog.noItems') }}
                </div>
                <catalog-result
                  v-else
                  v-for="(result, index) in subcategory.results"
                  :key="index"
                  :result="result"
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
import { QBtn, QExpansionItem, QIcon, QItemSection, QList, QSpinner } from 'quasar'
import Vue from 'vue'

import CatalogResult from 'src/lib/CatalogResult'
import CatalogResultComponent from './CatalogResult.vue'

export default {
  components: {
    CatalogResult: CatalogResultComponent,
    QBtn,
    QExpansionItem,
    QIcon,
    QItemSection,
    QList,
    QSpinner
  },
  data () {
    return {
      loading: false,
      q: '',
      subcategoriesOpen: {},
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
    addAll (subcategory) {
      subcategory.results
        .filter(result => result.isLayer)
        .forEach(result => {
          const layer = result.toLayer(this.$root)
          this.$store.dispatch('map/addLayer', layer)
        })
    },
    checkCategories () {
      this.loading = true
      const catalog = this.$config.catalog
      const config = catalog.auth ? this.$store.getters['auth/config'] : {}
      axios.get(catalog.categories, config)
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
        .then(() => {
          this.loading = false
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
      const catalog = this.$config.catalog
      const config = catalog.auth ? this.$store.getters['auth/config'] : {}
      const url = `${catalog.search}?category_id=${category.id}`
      axios.get(url, config)
        .then(response => {
          Vue.delete(category, 'loading')
          const results = response.data.results.map(CatalogResult.create)
          Vue.set(category, 'results', results)
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
    onShowSubcategory (subcategory) {
      this.subcategoryChange(subcategory)
      this.$set(this.subcategoriesOpen, subcategory.id, true)
    },
    onHideSubcategory (subcategory) {
      this.$set(this.subcategoriesOpen, subcategory.id, false)
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
