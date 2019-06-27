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
      :hint="hint"
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
        <q-icon
          v-if="field.null && value"
          class="control-icon q-px-md cursor-pointer all-pointer-events"
          name="cancel"
          @click="onClear()"
        />
      </template>
    </q-field>
    <div class="row justify-around">
      <q-img
        v-for="(v, i) in values"
        :key="'form-img-' + i"
        :src="getThumbnail(v)"
        @click="showImage(getUrl(v))"
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
import { QField, QIcon, QImg } from 'quasar'

import MultiValueMixin from '../mixins/MultiValueMixin'
import ValidateMixin from '../mixins/ValidateMixin'

import { AsyncPhoto } from '../../ImageField.js'

import resizeImage from 'src/lib/resizeImage'

import ImageDialog from 'components/ImageDialog'

export default {
  props: ['table', 'value', 'field', 'readonly', 'disable'],
  mixins: [MultiValueMixin, ValidateMixin],
  components: {
    QField,
    QIcon,
    QImg
  },
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
    },
    remote () {
      return this.table.remote
    }
  },
  methods: {
    getUrl (value) {
      return this.field.constructor.getUrl(value)
    },
    getThumbnail (value) {
      return this.field.constructor.getThumbnail(value)
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
        resizeImage(files[0], this.field.size).then(photo => {
          const newValue = new AsyncPhoto(photo, this.remote.source, this.remote.getConfig().headers)
          newValue.getValue().catch(this.$except)
          this.$store.dispatch('dataLayer/uploadPhoto', newValue)
          this.$emit('input', newValue)
        })
      }
    },
    showImage (src) {
      this.$store.dispatch('layout/createDialog', {
        component: ImageDialog,
        src
      })
    }
  }
}
</script>

<style lang="stylus">
.control-icon:hover
  color $grey-10
</style>
