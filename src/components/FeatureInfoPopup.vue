<template>
  <div class='popup'>
    <el-tabs @tab-click="handleClick">
      <div v-for='layer in results' class='layer'>
        <el-tab-pane class='popup-content'>
          <span v-if="layer.elements.length === 1" slot="label">{{ layer.attributes.name }}</span>
          <span v-if="layer.elements.length > 1" slot="label">{{ layer.attributes.name }} ({{ layer.elements.length }})</span>
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
        </el-tab-pane>
      </div>
    </el-tabs>
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
}
.popup-content {
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
