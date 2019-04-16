<template>
  <div class='popup'>
    <div v-html="popupDesign(feature)"></div>
    <div class="tools">
      <q-checkbox
        :value="feature.status.selected"
        @input="select"
      />
      <q-btn flat
        v-show="editing && !feature.status.deleted"
        icon="edit"
        :disable="saving"
        @click="edit"
      />
      <q-btn flat
        v-show="editing"
        icon="delete"
        :disable="saving"
        @click="remove"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: ['feature'],
  computed: {
    editing () {
      return this.$store.getters['dataLayer/editing']
    },
    saving () {
      return this.$store.state.dataLayer.editStatus.saving
    },
    popupDesign () {
      const layerInfo = this.$store.state.dataLayer.layerConfig.layerInfo
      return (layerInfo && layerInfo.design && layerInfo.design.popup) || (() => '')
    }
  },
  updated () {
    this.$nextTick(_ => this.$emit('updateSize'))
  },
  methods: {
    select (value) {
      this.feature.status.selected = value
      this.$emit('select', { feature: this.feature, value })
    },
    edit () {
      this.$emit('edit', this.feature)
    },
    remove () {
      this.$emit('delete', this.feature)
    }
  }
}
</script>

<style scoped>
.tools {
  display: inline-block;
}
.tool {
  font-size: 0.8em;
  text-align: center;
  display: inline-block;
  border-radius: 5px;
  padding: 5px 10px;
  margin-right: 5px;
  cursor: pointer;
}
.tool.select {
  padding: 0;
  color: #a0cfff;
}
.tool.remove {
  background-color: #eee;
}
</style>
