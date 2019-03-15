<template>
  <q-header class="giscube-header">
    <q-toolbar class="giscube-toolbar-buttons">
      <a class="giscube-header-brand" href="#"><img src="../assets/logo_giscube.svg"><span>Giscube Geoportal</span></a>

      <header-item-holder
        v-for="(item, i) in headerTools"
        :key="'header-tools-' + item.name + '-' + i"
        class="gt-xs"
        :item="item"
        @sidebar-visibility-changed="$emit('sidebar-visibility-changed', $event)"
        @event="emit"
      />

      <q-space class="lt-sm" />
      <q-btn flat icon="menu" class="lt-sm">
        <q-menu>
          <q-list>
            <header-item-holder
              v-for="(item, i) in headerTools"
              :key="'menu-header-tools-' + item.name + '-' + i"
              menu
              :item="item"
              @sidebar-visibility-changed="$emit('sidebar-visibility-changed', $event)"
              @event="emit($event)"
            />

          </q-list>
        </q-menu>
      </q-btn>

    </q-toolbar>

  </q-header>
</template>

<script>
import HeaderItemHolder from './HeaderItemHolder.vue'

export default {
  props: [
    'brand'
  ],
  components: {
    HeaderItemHolder
  },
  computed: {
    q () {
      return this.$store.state.searchQ
    },
    headerTools () {
      const tools = this.$config.tools
      let addSeparator = true
      const r = []
      this.$config.layout.headerToolbar.forEach((toolName, i) => {
        if (toolName.startsWith('-')) {
          r.push({ spacer: true, name: 'spacer-' + i })
          addSeparator = false // skip next separator
        } else {
          if (addSeparator) {
            r.push({ separator: true, name: 'separator-' + i })
          } else {
            // only skip a single one
            addSeparator = true
          }

          r.push({ name: toolName, tool: tools[toolName] })
        }
      })

      return r
    }
  },
  data () {
    return {}
  },
  methods: {
    emit (event) {
      this.$emit(event.name.toString(), event.value)
    },
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
