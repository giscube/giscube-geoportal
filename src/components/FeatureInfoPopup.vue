<template>
  <div class='popup'>
    <div v-for='layer in info' class='layer'>
      <div class='title'>{{ layer.attributes.name }}</div>
      <div v-for='feature in layer.elements' class='feature'>
        Feature {{ feature.attributes.id }}
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
  props: ['info'],
  data () {
    return {
    }
  }
}
</script>

<style lang="scss">
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
