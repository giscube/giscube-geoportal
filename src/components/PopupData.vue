<template>
  <div
    @click="onClick"
  >
    <div
      v-if="result && !resultIsError"
      style="min-width: 100%"
    >
      <div
        v-html="result"
        style="min-width: 100%"
      ></div>
      <q-resize-observer @resize="onResize" />
    </div>
    <div v-else-if="tableFallback && !result && !resultIsError">
      <table class="table table-striped table-hover">
        <tbody v-if="fields">
          <tr v-for='field in fields' class='attr' :key="field.name">
            <th>{{ field.label | capitalize }}</th>
            <td>{{ field.popupValue(feature) }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for='(value, name) in feature.properties' class='attr' :key="name">
            <th>{{ name }}</th>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-negative text-h6">{{ $t('messages.badPopupConfig') }}</div>
  </div>
</template>

<script>
import { QResizeObserver } from 'quasar'
import ImageDialog from 'components/ImageDialog'

const DIALOG_IMG_ATTR = 'data-dialog-img'

export default {
  props: {
    feature: Object,
    fields: Array,
    renderContents: Function,
    tableFallback: Boolean
  },
  components: {
    QResizeObserver
  },
  computed: {
    result () {
      try {
        if (!this.renderContents) {
          return false
        } else if (this.fields) {
          const values = {}
          this.fields.forEach(field => {
            values[field.name] = field.popupValue(this.feature)
          })
          return this.renderContents(values)
        } else {
          return this.renderContents({ ...this.feature.properties, obj: this.feature })
        }
      } catch (e) {
        let error = 'Bad popup template\'s configuration'
        if (e.message) {
          error += ` (${e.message})`
        }
        error = new Error(error)
        this.$except(error, { hide: true })
        return error
      }
    },
    resultIsError () {
      return this.result instanceof Error
    }
  },
  mounted () {
    this.$nextTick(_ => this.onResize())
  },
  updated () {
    this.$nextTick(_ => this.onResize())
  },
  methods: {
    onResize () {
      this.$parent.$emit('update-popup-size')
    },
    onClick (event) {
      const { target } = event
      if (target.hasAttribute(DIALOG_IMG_ATTR)) {
        this.$store.dispatch('layout/createDialog', {
          root: this,
          component: ImageDialog,
          src: target.getAttribute(DIALOG_IMG_ATTR)
        })
      }
    }
  }
}
</script>
