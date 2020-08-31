<template>
  <div>
    <q-file
      ref="filePicker"
      v-show="false"
      @input="setFile"
      :accepts="accepts"
    />
    <q-select
      filled
      :value="value"
      @input="setOption"
      :options="options"
      option-label="name"
      :label="label"
    >
      <template slot="append">
        <slot name="addBtn"/>
        <q-btn
          flat
          icon="attach_file"
          @click.stop="pickFiles"
        ></q-btn>
      </template>
    </q-select>
  </div>
</template>

<script>
import { QBtn, QFile, QSelect } from 'quasar'

export default {
  props: ['value', 'options', 'accepts', 'label'],
  components: {
    QBtn,
    QFile,
    QSelect
  },
  methods: {
    pickFiles () {
      this.$refs.filePicker.pickFiles()
    },
    setFile (file) {
      this.setOption({
        name: file.name,
        file
      })
    },
    setOption (option) {
      this.$emit('input', option)
    }
  }
}
</script>
