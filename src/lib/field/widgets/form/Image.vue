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
    <div class="row justify-around">
      <q-img
        v-for="(v, i) in values"
        :key="'form-img-' + i"
        :src="getUrl(v)"
        alt="getName(v)"
        contain
        basic
        class="q-ma-sm"
        style="height: 140px; max-width: 150px"
      />
    </div>
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
    values () {
      if (this.isMulti) {
        return Array.from(this.value.values).filter(v => v)
      } else {
        return this.value ? [ this.value ] : []
      }
    },
    filename () {
      return this.isMulti ? null : this.getName(this.value)
    },
    hint () {
      return null
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
        const newValue = new AsyncPhoto(files[0], this.$store.state.dataLayer.current.source, this.$store.getters['auth/headers'])
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
