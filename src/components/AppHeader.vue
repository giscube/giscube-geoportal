<template>
  <nav class="navbar navbar-expand-md navbar-light bg-light fixed-top">
    <a class="navbar-brand" href="#"><img src="../assets/logo_giscube.svg"><span>Giscube Geoportal</span></a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbars" aria-controls="navbars" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbars">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <a @click="$emit('home')"
             class="nav-link" href="#/"><span class="oi oi-home"></span> Home <span class="sr-only">(current)</span></a>
        </li>
        <li class="nav-item nav-catalog">
          <a @click="$emit('sidebar-visibility-changed', true)"
             class="nav-link" href="#/catalog/"><span class="oi oi-compass"></span>Catalog</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="mailto:contact@example.com"><span class="oi oi-envelope-closed"></span>Contact</a>
        </li>
        <li class="nav-item">
          <a @click="$emit('sidebar-visibility-changed', true)"
             class="nav-link" href="#/measure/"><span class="oi"><img src="../assets/ruler2.svg" /></span>Measure</a>
        </li>
      </ul>

    </div>
  </nav>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/question-circle'

export default {
  components: {
    Icon
  },
  props: [
    'brand'
  ],
  data () {
    return {}
  },
  methods: {

  }
}
</script>

<style>
body {
  padding-top: 61px;
}

/* navbar */
.navbar.bg-light {
  border-bottom: 1px solid #ccc;
  padding: 0px;
}
a.navbar-brand {
  padding: 10px 4px 10px 14px;
}
a.navbar-brand img {
  height: 40px;
  margin-right: 6px;
  vertical-align: top
}
a.navbar-brand span {
  font-weight: 200;
  display: inline-block;
  line-height: 1em;
  margin-top: 9px;
}
.nav-item {
  text-transform: uppercase;
  font-family: 'Lato', sans-serif;
  font-weight: 300;
  font-size: .8em;
  text-align: center;
  padding: 0 10px;
  border-left: 1px solid #ddd;
  padding: 0;
  margin: 0px;
}
.navbar-expand-md .navbar-nav .nav-link {
  padding:.7rem 1rem;
}
.navbar-light .navbar-nav .nav-link {
  color: #0a1924;
}
.navbar-light .navbar-nav .nav-link:focus, .navbar-light .navbar-nav .nav-link:hover {
  color: rgba(0,0,0,.7);
  background: #f1f1f1;
}
.nav-item span.oi, .nav-item i {
  display: block;
  margin-bottom: 4px;
  font-size: 1.2em
}
.navbar-light .navbar-nav .active > .nav-link, .navbar-light .navbar-nav .nav-link.active, .navbar-light .navbar-nav .nav-link.show, .navbar-light .navbar-nav .show > .nav-link {
  background: #e1e1e1;
}
.navbar-toggler {
  margin-right: 20px
}
.nav-item.user {
  border-top: 1px solid #ddd
}

/*media query*/
@media (min-width: 768px) {
  .nav-item.user {border-top:none}
}
</style>
