<template>
  <div class='popup'>
    <div class='title'>{{ title }}</div>
    <table class="table table-striped table-hover">
      <tbody>
        <tr v-for='(value, name) in feature.properties' class='attr' :key="name">
          <th>{{ name }}</th>
          <td>{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

export default {
  props: ['feature', 'title'],
  data () {
    return {
    }
  }
}
</script>

<style scoped lang="scss">
.popup {
}
.popup-content {
  max-height: 300px;
  overflow: auto;
}

.popup .title {
  font-size: 1.2em;
  font-weight: bold;
  min-width: 200px;
  margin-bottom: 8px;
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
