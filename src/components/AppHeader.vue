<template>
  <q-header class="giscube-header">
    <q-toolbar class="giscube-toolbar">
      <a class="giscube-header-brand" href="#"><img :src="brandLogo"><span>{{ brandText }}</span></a>

      <header-item-holder
        v-for="(item, i) in headerTools"
        :key="'header-tools-' + item.name + '-' + i"
        class="gt-xs"
        :class="'header-tools-' + item.name"
        :item="item"
        @sidebar-visibility-changed="$emit('sidebar-visibility-changed', $event)"
        @event="emit"
      />

      <q-space class="lt-sm" v-if="!printing" />
      <q-btn flat icon="menu" class="lt-sm" v-if="!printing">
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

      <!-- Print tools -->
      <header-item-holder
        v-for="(item, i) in printHeaderTools"
        :key="'header-tools-' + item.name + '-' + i"
        class="gt-xs"
        :class="{
            ['header-tools-' + item.name]: true,
            print: item.tool && item.tool.print
        }"
        :item="item"
        @event="emit"
      />

    </q-toolbar>

  </q-header>
</template>

<script>
import { QBtn, QHeader, QList, QMenu, QSpace, QToolbar } from 'quasar'
import HeaderItemHolder from './HeaderItemHolder'

export default {
  props: [
    'brandLogo',
    'brandText'
  ],
  components: {
    HeaderItemHolder,
    QBtn,
    QHeader,
    QList,
    QMenu,
    QSpace,
    QToolbar
  },
  data () {
    return {}
  },
  computed: {
    printing () {
      return this.$store.state.layout.printing
    },
    headerTools () {
      return !this.printing ? this.generateToolsFromList(this.$config.layout.headerToolbar) : []
    },
    printHeaderTools () {
      return this.printing ? this.generateToolsFromList(this.$config.layout.printHeaderToolbar, { separators: false }) : []
    }
  },
  methods: {
    emit (event) {
      this.$emit(event.name.toString(), event.value)
    },
    generateToolsFromList (list, { separators = true } = {}) {
      const tools = this.$config.tools
      let addSeparator = separators
      const r = []
      list.forEach((toolName, i) => {
        if (toolName.startsWith('-')) {
          r.push({ spacer: true, name: 'spacer-' + i })
          addSeparator = false // skip next separator
        } else if (toolName in tools) {
          if (addSeparator) {
            r.push({ separator: true, name: 'separator-' + i })
          } else {
            // only skip a single one
            addSeparator = separators
          }

          r.push({ name: toolName, tool: tools[toolName] })
        } else {
          console.warn(`[AppHeader.vue] Tool "${toolName}" is not defined in the current configuration.`)
        }
      })

      return r
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
.giscube-toolbar > :not(.giscube-header-brand) {
  text-transform: uppercase;
}
.giscube-toolbar .q-btn {
  font-weight: 300;
  padding: 6px 16px;
  font-size: .9em;
}
.giscube-toolbar .q-btn i {
  font-size: 20px;
}
@media (max-width: 991px) {
  a.giscube-header-brand img {
    height: 34px;
  }
  a.giscube-header-brand span {
    font-size: 16px;
  }
  .giscube-toolbar .q-btn {
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
  .giscube-toolbar .q-btn {
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
