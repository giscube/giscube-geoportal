<template>
  <div class='popup'>
    <q-tabs v-model="current">
      <q-tab
        v-for="(layer, layerIndex) in results"
        :key="'featureInfoPopup-' + layerIndex"
        :name="layerIndex"
        :label="layer.attributes.name"
      />
    </q-tabs>

    <table
      v-if="results"
      class="table table-striped table-hover"
    >
      <tbody
        v-for='(feature, featureIndex) in layer.elements'
        :key="'feature-' + featureIndex"
      >
        <tr
          v-for='(attr, attrIndex) in feature.elements'
          class='attr'
          :key="'feature-' + featureIndex + '-attr-' + attrIndex"
        >
          <th>{{ attr.attributes.name }}</th>
          <td>{{ attr.attributes.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

export default {
  props: ['results'],
  data () {
    return {
      current: 0
    }
  },
  computed: {
    layer () {
      return this.results[this.current]
    }
  }
}
</script>

<style lang="scss">
.popup {
  max-height: 40vh;
  max-width: 50vw;
  overflow: auto;
}

.layer .title {
  font-size: 1.2em;
  font-weight: bold;
  min-width: 200px;
}

.layer .feature {
  font-weight: bold;
  border-bottom: 3px solid #aaa;
  margin-bottom: 20px;
}

.layer .feature:last-child {
  border-bottom: 0px;
  margin-bottom: 0px;
}

.table > tbody > tr > th, .table > tbody > tr > td {
  padding: 3px;
  margin-bottom: 0px;
}

</style>
