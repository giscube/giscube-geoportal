<template>
  <div>
    <input
      ref="files"
      type="file"
      accept="image/*"
      style="display: none"
      @input="upload"
    />
    <q-field
      :readonly="readonly"
      :disable="disable"
      :label="field.label"
      :stack-label="!!filename"
      :clearable="field.null"
      :hint="hint"
      @input="onClear"
    >
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">{{ filename }}</div>
      </template>
      <template
        v-slot:append
        v-if="!readonly"
      >
        <q-icon
          class="control-icon q-px-md cursor-pointer all-pointer-events desktop-hide"
          name="camera_alt"
          @click="askFile(true)"
        />
        <q-icon
          class="control-icon q-px-md cursor-pointer all-pointer-events"
          name="folder"
          @click="askFile(false)"
        />
      </template>
    </q-field>
    <q-img
      v-for="src in srcs"
      :key="src"
      :src="src"
      contain
      style="max-height: 10em; width: 100%"
    />
  </div>
</template>

<script>
import { notifyHttpError } from '../../../notifications'
import MultiValueMixin from '../mixins/MultiValueMixin'
import ValidateMixin from '../mixins/ValidateMixin'

import { AsyncPhoto } from '../../ImageField.js'

export default {
  props: ['value', 'field', 'readonly', 'disable'],
  mixins: [MultiValueMixin, ValidateMixin],
  computed: {
    srcs () {
      if (this.isMulti) {
        return Array.from(this.value.values).filter(v => v).map(v => this.getUrl(v))
      } else {
        return [ this.getUrl(this.value) ]
      }
    },
    filename () {
      return this.isMulti ? null : this.getName(this.value)
    },
    hint () {
      return this.isMulti ? Array.from(this.value.values).map(value => this.getName(value)).join(', ') : null
    }
  },
  methods: {
    getUrl (value) {
      return this.field.constructor.getUrl(value)
    },
    getName (value) {
      return this.field.constructor.getFilename(value)
    },
    onClear (v = null) {
      if (v === null) {
        this.$emit('input', { src: null })
      }
    },
    askFile (capture) {
      const el = this.$refs.files
      if (capture) {
        el.setAttribute('capture', '')
      } else {
        el.removeAttribute('capture')
      }
      el.click()
    },
    upload () {
      const files = this.$refs.files.files
      if (files.length > 0) {
        const newValue = new AsyncPhoto(files[0], this.$store.state.dataLayer.current.source, 0)
        newValue.getValue().catch(notifyHttpError)
        this.$store.dispatch('dataLayer/uploadPhoto', newValue)
        this.$emit('input', newValue)
      }
    }
  }
}
</script>

<style lang="stylus">
@import '~quasar-variables'

.control-icon:hover
  color $grey-10
</style>
