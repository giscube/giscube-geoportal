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
        v-if="!readonly && !saving"
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
      v-if="src"
      :src="src"
      contain
      style="max-height: 10em; width: 100%"
    />
  </div>
</template>

<script>
import { notifyHttpError } from '../../../notifications.js'

import MultiValueMixin from '../mixins/MultiValueMixin'
import ValidateMixin from '../mixins/ValidateMixin'

export default {
  props: ['value', 'field', 'readonly', 'disable'],
  mixins: [MultiValueMixin, ValidateMixin],
  data () {
    return {
      saving: false,
      tempFile: null,
      tempSrc: null
    }
  },
  computed: {
    hint () {
      return null
    },
    src () {
      console.log(this.value)
      return this.tempSrc || (this.value && this.value.src)
    },
    filename () {
      if (this.tempFile) {
        return this.tempFile.name
      }

      const url = this.value && this.value.src
      return this.field.constructor.urlFilename(url)
    }
  },
  methods: {
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
        this.saving = true
        this.tempFile = files[0]
        this.tempSrc = URL.createObjectURL(this.tempFile)

        this.$store.dispatch('dataLayer/uploadPhoto', this.tempFile)
          .then(result => {
            URL.revokeObjectURL(this.tempSrc)
            this.tempFile = null
            this.tempSrc = null
            this.saving = false
            this.$emit('input', result)
          })
          .catch(error => {
            this.saving = false
            this.tempFile = null
            this.tempSrc = null
            URL.revokeObjectURL(this.tempSrc)
            notifyHttpError(error)
            console.error(error)
          })
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
