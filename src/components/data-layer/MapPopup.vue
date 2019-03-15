<template>
  <div class='popup'>
    <p>{{feature.properties.n_comu}} al {{feature.properties.nom_car}} ({{feature.properties.codi}})</p>
    <div class="tools">
      <q-checkbox
        :value="feature.status.selected"
        @input="select"
      />
      <q-btn flat
        icon="edit"
        :disabled="!editing || feature.status.deleted"
        @click="edit"
      />
      <q-btn flat
        icon="delete"
        :disabled="!editing"
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
    }
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
