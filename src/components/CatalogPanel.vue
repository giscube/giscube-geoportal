<template>
  <div class="panel">
    <div class="panel-content">
      <p class="panel-title">Catalog</p>

      <div v-if="!categories"><icon name="spinner" pulse label="Searching"></icon></div>
      <div v-if="categories" class="categories">
        <el-collapse class="category">
          <el-collapse-item v-for="category in categories"
            v-show="category.parent === null"
            :key="category.id"
            :title="category.name" :name="category.id">
            <el-collapse class="subcategory"
              @item-click="subcategoryChange">
              <el-collapse-item v-for="subcategory in category.subcategories"
                v-show="subcategory"
                :key="subcategory.id"
                :title="subcategory.name" :name="subcategory.id">
                <div v-if="!subcategory.results"><icon name="spinner" pulse label="Searching"></icon></div>
                <div v-if="subcategory.results">
                  <CatalogResult v-for="(result, index) in subcategory.results" :result='result'
                    :key="index" :map='map' />
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-collapse-item>
        </el-collapse>
      </div>

    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/spinner'

import CatalogResult from './CatalogResult.vue'

export default {
  components: {
    Icon,
    CatalogResult
  },
  props: ['map'],
  data () {
    return {
      q: '',
      categories: null
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
          this.categories = response.data
          this.categories.forEach(category => {
            if (category.parent == null) {
              category.subcategories = this.getSubcategories(category.id)
            }
          })
          window.categories = this.categories
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
          Vue.set(category, 'results', response.data.results)
        })
        .catch(error => {
          console.log(error)
        })
    },
    subcategoryChange (val) {
      let categoryId = val.name
      let category = this.categories.find(element => element.id === categoryId)
      if (!category.results) {
        this.getSubcategoriesResults(category)
      } else {
      }
    }
  }
}
</script>

<style>
.list-group-item {
  min-height: 65px;
}

.category .el-collapse-item__header {
  padding-left: 10px;
  font-size: 1.2em;
  background-color: #dfdfdf;
}
.category .el-collapse-item__content {
  padding: 0px;
}

.subcategory .el-collapse-item__header {
  padding-left: 20px;
  font-size: 1.1em;
  background-color: #f5f5f5;
}
.subcategory .el-collapse-item__content {
}
</style>
