<template>
  <div class="panel">
    <p class="panel-title">Welcome!</p>
    <p>Useful links</p>
    <ul>
      <li><a href="https://www.github.com/giscube" target="_blank">Giscube at GitHub</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloPanel',
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

.panel {
    padding: 0 20px 15px 20px;
}
.panel-title {
  font-size: 1.5em;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  margin-bottom: 10px;
}

</style>
