<template>
  <div>
    <div v-if="description" class="description">
      {{ description }}
    </div>

    <div class="legend" v-if="result && legend">
      <p class="panel-subtitle">{{ $t('names.legend') | capitalize }}</p>
      <div v-html="legend"></div>
    </div>

    <div v-if="downloads && downloads.length > 0">
      <p class="panel-subtitle">{{ $t('names.downloads') | capitalize }}</p>
      <q-list separator dense>
        <q-item
          v-for="download in downloads"
          v-bind:key="download.id"
        >
          <q-item-section>
            <q-item-label>{{ download.title }}</q-item-label>
            <q-item-label v-if="download.description" caption lines="2">{{ download.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-spinner v-if="openingFiles.includes(download.url)"></q-spinner>
            <q-btn
              v-else
              flat dense no-caps
              icon="search"
              @click="open(download)"
            >
              <q-tooltip>{{$t('actions.explore') | capitalize}}</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
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
import { QBtn, QChip, QItem, QItemLabel, QItemSection, QList, QSpinner, QTooltip } from 'quasar'
import axios from 'axios'
import { saveAs } from 'file-saver'

export default {
  props: ['description', 'result', 'legend', 'downloads', 'keywords'],
  components: {
    QBtn, QChip, QItem, QItemLabel, QItemSection, QList, QSpinner, QTooltip
  },
  data () {
    return {
      openingFiles: []
    }
  },
  methods: {
    open (download) {
      const url = download.url
      this.openingFiles.push(url)
      const isAuthenticated = this.result.private || (this.result.origin && this.result.origin.auth)
      const headers = isAuthenticated ? this.$store.getters['auth/headers'] : void 0
      const conf = {
        headers: headers,
        responseType: 'arraybuffer'
      }
      axios.get(url, conf).then(response => {
        const contentType = response.headers['content-type']
        const fileBlob = new Blob([response.data], { type: contentType })
        if (this.$config.components.resultTabs.infoTab.previewContentTypes.includes(contentType)) {
          const fileURL = window.URL.createObjectURL(fileBlob)
          window.open(fileURL)
        } else {
          const fileName = url.split('/').pop()
          saveAs(fileBlob, fileName)
        }
        this.openingFiles = this.openingFiles.filter(file => file !== url)
      }).catch(error => {
        this.openingFiles = this.openingFiles.filter(file => file !== url)
        this.$except(error)
      })
    },
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
