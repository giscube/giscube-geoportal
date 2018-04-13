<template>
  <div class='popup'>
    <div v-for='layer in results' class='layer'>
      <div class='title'>{{ layer.attributes.name }}</div>
      <div v-for='feature in layer.elements' class='feature'>
        <table class="table table-striped table-hover">
          <tbody>
            <tr v-for='attr in feature.elements' class='attr'>
              <th>{{ attr.attributes.name }}</th>
              <td>{{ attr.attributes.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['results'],
  data () {
    return {
    }
  }
}
</script>

<style lang="scss">
.popup {
  max-height: 300px;
  overflow: auto;
}

.layer .title {
  font-size: 1.2em;
  font-weight: bold;
  min-width: 200px;
}

.layer .feature {
  font-weight: bold;
}

.table > tbody > tr > th, .table > tbody > tr > td {
  padding: 3px
}

</style>
