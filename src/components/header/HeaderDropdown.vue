<template>
  <q-btn-dropdown v-if="!menu"
    stack flat split stretch
    :icon="icon"
    :label="label"
    v-model="showDropdown"
    @click="showDropdown = !showDropdown"
  >
    <q-list>
      <div
        v-for="(item, i) in items"
        :key="'menu-header-tools-' + item.name + '-' + i"
      >
        <q-separator v-if="item.separator"/>
        <component
          v-else
          :is="dropdownItemComponent(item.tool)"
          :name="item.name"
          :tool="item.tool"
          :menu="true"
        />
      </div>
    </q-list>
  </q-btn-dropdown>
  <div v-else>
    <div
      v-for="(item, i) in menuItems"
      :key="'menu-header-tools-' + item.name + '-' + i"
    >
      <component
        v-if="!item.separator"
        :is="dropdownItemComponent(item.tool)"
        :name="item.name"
        :tool="item.tool"
        :menu="true"
      />
    </div>
  </div>
</template>

<script>
import { ClosePopup, QBtnDropdown, QIcon, QItem, QItemSection, QList, QSeparator } from 'quasar'

export default {
  props: {
    icon: {
      type: String,
      required: false
    },
    label: {
      type: String,
      required: false
    },
    menu: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      required: true
    }
  },
  components: {
    QBtnDropdown,
    QIcon,
    QItem,
    QItemSection,
    QList,
    QSeparator
  },
  data () {
    return {
      showDropdown: false
    }
  },
  directives: {
    ClosePopup
  },
  computed: {
    menuItems () {
      return this.items.filter(item => item.separator || !item.tool.supported || item.tool.supported.call(this, item.tool))
    }
  },
  methods: {
    dropdownItemComponent (tool) {
      return tool.headerComponent || require('./HeaderItem.vue').default
    },
    t (key) {
      return this.$t('tools.' + key + '.headerName')
    }
  }
}
</script>
