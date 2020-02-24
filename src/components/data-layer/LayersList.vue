<template>
  <q-list class="datalayer-layerslist" :class="{'full-width': value}">
    <q-expansion-item
      ref="parent"
      :value="value"
      :dense="!value"
      :disable="disable"
      @input="$emit('input', $event)"
    >
      <template v-slot:header>
        <q-item-section>
          <q-item-label class="text-h6">
            {{ mainLabel }}
            <q-badge v-if="loadingErrors > 0" color="negative" align="middle">
              {{loadingErrors}}
              <q-icon name="error" color="white" class="q-ml-xs" />
            </q-badge>
          </q-item-label>
        </q-item-section>
        <q-item-section
          side
          v-if="$store.state.dataLayer.sources === null"
        >
          <q-spinner />
        </q-item-section>
        <q-item-section side v-if="value">
          <q-item-label>
            <q-btn
              v-show="table"
              icon="close"
              flat
              dense
              @click.stop="$emit('close')"
            />
            <q-btn
              icon="refresh"
              flat
              dense
              @click.stop="refresh"
            />
          </q-item-label>
        </q-item-section>
      </template>
      <q-item
        v-if="$store.state.dataLayer.sources === null"
      >
        <q-item-section class="text-caption">{{ $t('states.loading') | capitalize }}</q-item-section>
      </q-item>
      <q-item
        v-else-if="sources.length < 1"
      >
        <q-item-section v-if="loadingErrors > 0" class="text-caption">{{ t('errorsLoadingSources') }}</q-item-section>
        <q-item-section v-else class="text-caption">{{ $t('states.empty') | capitalize }}</q-item-section>
      </q-item>
      <q-list
        v-else
        v-for="(source, i) in sources"
        :key="'source-' + i"
      >
        <q-item v-if="sources.length > 1" class="header">
          <q-item-section>{{ source.name }}</q-item-section>
        </q-item>
        <q-item
          v-for="(layer, j) in source.layers"
          :key="'layer-' + i + '-' + j"
          clickable
          v-ripple
          @click="onSelectItem({ source, layer })"
        >
          <q-item-section>{{ layer.title || layer.name }}</q-item-section>
        </q-item>
        <q-item
          v-if="!source.layers.length"
        >
          <q-item-section class="text-caption">{{ $t('states.empty') | capitalize }}</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
  </q-list>
</template>

<script>
import { Ripple, QBadge, QBtn, QExpansionItem, QIcon, QItem, QItemLabel, QItemSection, QList, QSpinner } from 'quasar'
import { isPart } from 'src/lib/utils'
import TranslationMixin from './TranslationMixin'

export default {
  mixins: [TranslationMixin],
  props: {
    value: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  components: {
    QBadge,
    QBtn,
    QExpansionItem,
    QIcon,
    QItem,
    QItemLabel,
    QItemSection,
    QList,
    QSpinner
  },
  directives: {
    Ripple
  },
  computed: {
    sources () {
      return this.$store.getters['dataLayer/sources']
    },
    table () {
      return this.$store.state.dataLayer.table
    },
    mainLabel () {
      if (this.table) {
        let base = ''
        if (this.sources.length > 1) {
          base = `${this.table.remote.source.name} > `
        }
        return base + (this.table.remote.layer.title)
      } else {
        return this.t('title')
      }
    },
    loadingErrors () {
      return this.$store.state.dataLayer.loadingSourceErrors.length
    }
  },
  watch: {
    disable (newValue) {
      if (newValue) {
        this.$refs.parent.hide()
      }
    }
  },
  methods: {
    refresh () {
      this.$store.dispatch('dataLayer/refreshSources')
        .then(() => this.$emit('input', true))
    },
    onSelectItem ({ source, layer }) {
      this.$emit('input', false)

      const route = {
        name: 'data',
        params: {
          sourceName: source.name,
          layerName: layer.name
        }
      }
      if (isPart(this.$route, route)) {
        return
      }
      this.$nextTick(_ => {
        this.$router.push(route)
      })
    }
  }
}
</script>
<style>
.datalayer-layerslist .q-item.header {
  font-weight: bold;
  background-color: #a1d7f5;
}
</style>
