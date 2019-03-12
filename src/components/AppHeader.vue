<template>
  <q-header class="giscube-header">
    <q-toolbar class="giscube-toolbar-buttons">
      <a class="giscube-header-brand" href="#"><img src="../assets/logo_giscube.svg"><span>Giscube Geoportal</span></a>

      <q-separator vertical class="gt-xs"/>

      <q-btn stack flat stretch
        icon="home"
        label="Home"
        :to="{ name: 'home' }"
        @click="$emit('home')"
        class="gt-xs"
      />

      <q-separator vertical class="gt-xs" />

      <q-btn stack flat stretch
        icon="search"
        label="Search"
        @click="onSearch"
        class="gt-xs"
      />

      <q-separator vertical class="gt-xs" />

      <q-btn stack flat stretch
        icon="ion-compass"
        label="Catalog"
        :to="{ name: 'catalog' }"
        @click="$emit('sidebar-visibility-changed', true)"
        class="gt-xs"
      />

      <q-separator vertical class="gt-xs" />

      <q-btn stack flat stretch
        icon="email"
        label="Contact"
        :to="{ name: 'contact' }"
        @click="$emit('sidebar-visibility-changed', true)"
        class="gt-xs"
      />

      <q-separator vertical class="gt-xs" />

      <q-btn stack flat stretch
        icon="mdi-ruler"
        label="Measure"
        :to="{ name: 'measure' }"
        @click="$emit('sidebar-visibility-changed', true)"
        class="gt-xs"
      />

      <q-separator vertical class="gt-xs" />

      <q-btn stack flat stretch
        icon="print"
        label="Print"
        @click="$emit('print')"
        class="gt-xs"
      />

      <q-space />

      <q-btn stack flat stretch
        v-if="$q.fullscreen.isCapable"
        :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
        @click="$q.fullscreen.toggle()"
        class="gt-xs"
      />

      <q-btn class="lt-sm" flat icon="menu">
        <q-menu>
          <q-list>
            <q-item
              clickable
              v-close-menu
              :to="{ name: 'home' }"
              @click="$emit('home')"
            >
              <q-item-section side>
                <q-icon name="home" />
              </q-item-section>
              <q-item-section>Home</q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-menu
              :to="{ name: 'search' }"
              @click="onSearch"
            >
              <q-item-section side>
                <q-icon name="search" />
              </q-item-section>
              <q-item-section>Search</q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-menu
              :to="{ name: 'catalog' }"
              @click="$emit('sidebar-visibility-changed', true)"
            >
              <q-item-section side>
                <q-icon name="ion-compass" />
              </q-item-section>
              <q-item-section>Catalog</q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-menu
              :to="{ name: 'contact' }"
              @click="$emit('sidebar-visibility-changed', true)"
            >
              <q-item-section side>
                <q-icon name="email" />
              </q-item-section>
              <q-item-section>Contact</q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-menu
              :to="{ name: 'measure' }"
              @click="$emit('sidebar-visibility-changed', true)"
            >
              <q-item-section side>
                <q-icon name="mdi-ruler" />
              </q-item-section>
              <q-item-section>Measure</q-item-section>
            </q-item>

            <q-separator />

            <q-item
              clickable
              v-close-menu
              @click="$emit('print')"
            >
              <q-item-section side>
                <q-icon name="print" />
              </q-item-section>
              <q-item-section>Print</q-item-section>
            </q-item>

            <q-separator />

            <q-item
              clickable
              v-close-menu
              @click="$q.fullscreen.toggle()"
            >
              <q-item-section side>
                <q-icon :name="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'" />
              </q-item-section>
              <q-item-section>{{ $q.fullscreen.isActive ? 'Exit fullscreen' : 'Fullscreen' }}</q-item-section>
            </q-item>

          </q-list>
        </q-menu>
      </q-btn>

    </q-toolbar>

  </q-header>
</template>

<script>
export default {
  props: [
    'brand'
  ],
  computed: {
    q () {
      return this.$store.state.searchQ
    }
  },
  data () {
    return {}
  },
  methods: {
    onSearch () {
      this.$emit('sidebar-visibility-changed', true)
      if (this.q) {
        this.$router.push({ name: 'search', params: { q: this.q } })
      } else {
        this.$router.push({ name: 'search' })
      }
    }
  }
}
</script>

<style>
.full-min-width {
  min-width: 100% !important;
  display: inline-block;
}
/* q-header */
.giscube-header {
  background-color: #f8f9fa !important;
  border-bottom: 1px solid #ccc;
  padding: 0px;
  color: #0a1924;
  font-family: 'Lato', sans-serif;
}
a.giscube-header-brand {
  padding: 10px 20px 10px 0px;
  color: #0a1924;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
a.giscube-header-brand img {
  height: 40px;
  margin-right: 6px;
  vertical-align: top
}
a.giscube-header-brand span {
  font-weight: 300;
  font-size: 20px;
  display: inline-block;
  line-height: 1em;
  margin-top: 9px;
}
.giscube-toolbar-buttons .q-btn {
  font-weight: 300;
  padding: 6px 16px;
  font-size: .9em;
  text-transform: uppercase;
}
.giscube-toolbar-buttons .q-btn i {
  font-size: 20px;
}
@media (max-width: 991px) {
  a.giscube-header-brand img {
    height: 34px;
  }
  a.giscube-header-brand span {
    font-size: 16px;
  }
  .giscube-toolbar-buttons .q-btn {
    padding: 4px 14px;
    font-size: .8em;
  }
}

@media (max-width: 767px) {
  a.giscube-header-brand img {
    height: 30px;
  }
  a.giscube-header-brand span {
    font-size: 14px;
  }
  .giscube-toolbar-buttons .q-btn {
    padding: 2px 10px;
    font-size: .7em;
  }
}
.nav-item.user {
  border-top: 1px solid #ddd
}

/*media query*/
@media (min-width: 768px) {
  .nav-item.user {border-top:none}
}
</style>
