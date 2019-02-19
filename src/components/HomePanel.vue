<template>
  <div class="panel">

    <search-bar />

    <div class="panel-content">
      <p class="panel-title">Welcome!</p>

      <p>Useful links</p>
      <ul>
        <li><a href="https://www.github.com/giscube" target="_blank">Giscube at GitHub</a></li>
      </ul>
    </div>
  </div>
</template>

<script>
import SearchBar from 'components/SearchBar.vue'

export default {
  name: 'HomePanel',
  components: {
    SearchBar
  },
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

</style>
