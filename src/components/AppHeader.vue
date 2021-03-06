<template>
  <q-header class="giscube-header">
    <q-toolbar class="giscube-toolbar">
      <a class="giscube-header-brand cursor-pointer" :href="brandLink" v-touch-hold:2500.mouse="infoPopup"><img :src="brandLogo"><span>{{ brandText }}</span></a>

      <header-item-holder
        v-for="(item, i) in headerTools"
        :key="'header-tools-' + item.name + '-' + i"
        class="gt-sm"
        :class="'header-tools-' + item.name"
        :item="item"
        @sidebar-visibility-changed="$emit('sidebar-visibility-changed', $event)"
        @event="emit"
      />

      <q-space class="lt-md" v-if="!printing" />
      <q-btn flat icon="menu" class="lt-md" v-if="!printing">
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
import { QBtn, QHeader, QList, QMenu, QSpace, QToolbar, TouchHold } from 'quasar'
import { VERSION } from 'src/meta'
import HeaderItemHolder from './header/HeaderItemHolder'

export default {
  props: [
    'brandLogo',
    'brandText',
    'brandLink'
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
  directives: {
    TouchHold
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
        if (toolName.constructor === Object) {
          const items = toolName.items.map(name => {
            return name.startsWith('-') ? { separator: true, name: 'separator-' + i } : { name: name, tool: tools[name] }
          })
          if (addSeparator) {
            r.push({ separator: true, name: 'separator-' + i })
          } else {
            // only skip a single one
            addSeparator = separators
          }
          r.push({ icon: toolName.icon, label: toolName.label, items: items })
        } else if (toolName.startsWith('-')) {
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
    },
    infoPopup () {
      this.$store.dispatch('layout/createDialog', {
        root: this,
        title: 'Development information',
        message: `Geoportal version: ${VERSION}`
      })
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
  background-color: #f8f9fa;
  border-bottom: 1px solid #ccc;
  padding: 0px;
  color: #0a1924;
  font-family: 'Lato', sans-serif;
}
a.giscube-header-brand {
  padding: 10px 20px 10px 0px;
  overflow: visible;
  white-space: nowrap;
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
a.giscube-header-brand {
  color: inherit;
}
.giscube-toolbar .q-btn {
  font-weight: 300;
  font-size: .9em;
}
.giscube-toolbar .q-btn i {
  font-size: 20px;
}
@media (max-width: 1460px) {
  a.giscube-header-brand img {
    height: 34px;
  }
  a.giscube-header-brand span {
    font-size: 16px;
  }
  .giscube-toolbar .q-btn {
    font-size: .8em;
  }
}

@media (max-width: 1330px) {
  a.giscube-header-brand img {
    height: 30px;
  }
  a.giscube-header-brand span {
    font-size: 14px;
  }
  .giscube-toolbar .q-btn {
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
