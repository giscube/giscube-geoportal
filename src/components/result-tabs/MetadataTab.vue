<template>
  <div>
    <q-list separator dense>
      <q-item v-if="layerDescriptor && layerDescriptor.length > 0">
        <q-item-section>
          <q-item-label>{{ layerDescriptor[0].name }}</q-item-label>
          <q-item-label caption v-if="layerDescriptor[0].href">
            <a :href="layerDescriptor[0].href" target="_blank">{{ layerDescriptor[0].text }}</a>
          </q-item-label>
          <q-item-label caption v-else>{{ layerDescriptor[0].text }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div>
            <q-btn flat dense no-caps
              v-if="layerDescriptor[0].type.toLowerCase() === 'geojson'"
              icon="search"
              @click="open(layerDescriptor[0].text)"
            >
              <q-tooltip>{{$t('actions.explore') | capitalize}}</q-tooltip>
            </q-btn>
            <q-btn flat dense no-caps
              v-else-if="layerDescriptor[0].type.toLowerCase() === 'wms'"
              icon="search"
              @click="open(layerDescriptor[0].href)"
            >
              <q-tooltip>{{$t('actions.explore') | capitalize}}</q-tooltip>
            </q-btn>
            <q-btn flat dense no-caps
              v-clipboard:copy="layerDescriptor[0].text"
              v-clipboard:success="doCopy"
              :icon="copied ? 'fas fa-check' : 'fas fa-copy'"
              :color="copied ? 'green' : void 0"
            >
              <q-tooltip>{{$t('actions.copy') + ' URL' | capitalize}}</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
      <q-item v-if="layerDescriptor && layerDescriptor.length > 0 && layerDescriptor[0].type">
        <q-item-section>{{$t('names.type') | capitalize}}</q-item-section>
        <q-item-section side>{{layerDescriptor[0].type}}</q-item-section>
      </q-item>
      <q-item v-for="item in metadataList" :key="item.name">
        <q-item-section v-if="item.data.length < 60">{{ item.name | capitalize }}</q-item-section>
        <q-item-section v-if="item.data.length < 60 && item.type === 'web'" side>
          <a :href="item.data" target="_blank">{{ item.data }}</a>
        </q-item-section>
        <q-item-section v-else-if="item.data.length < 60" side>
          {{ item.data }}
        </q-item-section>
        <q-item-section v-else>
          <q-item-label>{{ item.name | capitalize }}</q-item-label>
          <q-item-label caption>{{ item.data }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import moment from 'moment'
import { QBtn, QItem, QItemSection, QItemLabel, QList, QTooltip } from 'quasar'

import { codeToNativeName } from 'src/lib/language'

export default {
  props: ['metadata', 'layerDescriptor'],
  components: {
    QBtn,
    QItem,
    QItemSection,
    QItemLabel,
    QList,
    QTooltip
  },
  data () {
    return {
      copied: false
    }
  },
  computed: {
    date () {
      return this.metadata && this.metadata.date && moment(this.metadata.date).format('DD/MM/YYYY')
    },
    metadataList () {
      if (!this.metadata) {
        return
      }
      let metadataList_ = []
      if (this.date) {
        metadataList_.push(this.listItem('date', this.date))
      }
      if (this.metadata.summary) {
        metadataList_.push(this.listItem('summary', this.metadata.summary))
      }
      if (this.metadata.category) {
        metadataList_.push(this.listItem('category', this.metadata.category))
      }
      if (this.metadata.language) {
        metadataList_.push(this.listItem('language', this.metadata.language, 'lang'))
      }
      if (this.metadata.information) {
        metadataList_.push(this.listItem('information', this.metadata.information))
      }
      if (this.metadata.provider_web) {
        metadataList_.push(this.listItem('provider_web', this.metadata.provider_web, 'web'))
      }
      if (this.metadata.provider_name) {
        metadataList_.push(this.listItem('provider_name', this.metadata.provider_name))
      }
      if (this.metadata.provider_email) {
        metadataList_.push(this.listItem('provider_email', this.metadata.provider_email))
      }
      return metadataList_
    }
  },
  methods: {
    doCopy () {
      this.copied = true
    },
    listItem (name, data, type = null) {
      name = this.$t(`metadata.${name}`)
      data = data.trim()
      if (type === 'lang') {
        data = codeToNativeName(data)
      }
      return { name, data, type }
    },
    open (url) {
      window.open(url)
    }
  }
}
</script>
