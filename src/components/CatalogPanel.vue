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
            @show="$store.dispatch('catalog/categoryChange', category)"
            header-class="category"
            v-model="categoriesOpen[category.id]"
          >
            <q-expansion-item v-for="subcategory in category.subcategories"
              v-show="subcategory.results ? subcategory.results.length > 0 : false"
              :key="subcategory.id"
              @show="$store.dispatch('catalog/onShowSubcategory', subcategory)"
              header-class="subcategory"
              v-model="subcategoriesOpen[subcategory.id]"
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
                    style="color: initial"
                    icon="layers"
                    :disable="subcategory.loading"
                    @click.stop="addAll(subcategory)"
                  >
                    <q-badge color="transparent" dense flat floating style="font-size: 0.6em; right: -1em">
                      <q-icon name="add" align="top" color="black" />
                    </q-badge>
                  </q-btn>
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
import { QBadge, QBtn, QExpansionItem, QIcon, QItemSection, QList, QSpinner } from 'quasar'

import CatalogResultComponent from './CatalogResult.vue'

import { createNamespacedHelpers } from 'vuex'
const { mapState: mapCatalogState } = createNamespacedHelpers('catalog')

export default {
  components: {
    CatalogResult: CatalogResultComponent,
    QBadge,
    QBtn,
    QExpansionItem,
    QIcon,
    QItemSection,
    QList,
    QSpinner
  },
  computed: {
    ...mapCatalogState({
      categories: state => state.categories,
      categoriesOpen: state => state.categoriesOpen,
      loading: state => state.loading,
      subcategoriesOpen: state => state.subcategoriesOpen
    })
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.q = to.params.q
      vm.$store.dispatch('catalog/checkCategories')
    })
  },
  beforeRouteUpdate (to, from, next) {
    let vm = this
    vm.q = to.params.q
    vm.$store.dispatch('catalog/checkCategories')
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
