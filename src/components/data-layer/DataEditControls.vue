<template>
  <div
    v-show="editing"
    class="row items-center space-items-xs"
  >
    <q-btn-group>
      <q-btn
        :label="t('newElement')"
        @click="newRow()"
      />
      <q-btn
        icon="settings"
        size="xs"
        dense
        class="q-px-sm"
        @click="setDefaults"
      />
    </q-btn-group>
    <q-btn-dropdown
      v-show="table.visibleSelectedList.length > 0"
      split
      :label="t('editElements', { elements: elementsT })"
      @click="table.uiEditSelected()"
    >
      <q-list>
        <q-item
          clickable
          v-close-popup
          @click="undoSelected()"
        >
          <q-item-section>
            <q-item-label>{{ t('undoElements', { elements: elementsT }) }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="table.deleteSelected()"
        >
          <q-item-section>
            <q-item-label>{{ t('deleteElements', { elements: elementsT }) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <defaults-dialog
      ref="defaultDialog"
      :table="table"
      :row="defaultRow"
      :editMultiple.sync="editMultiple"
      :dialogForNew.sync="dialogForNew"
      :selectNews.sync="selectNews"
    />
  </div>
</template>

<script>
import { ClosePopup, QBtn, QBtnDropdown, QBtnGroup, QItem, QItemLabel, QItemSection, QList } from 'quasar'

import TranslationMixin from './TranslationMixin'
import DefaultsDialog from './DefaultsDialog'

export default {
  mixins: [TranslationMixin],
  props: ['table'],
  components: {
    DefaultsDialog,
    QBtn,
    QBtnDropdown,
    QBtnGroup,
    QItem,
    QItemLabel,
    QItemSection,
    QList
  },
  directives: {
    ClosePopup
  },
  data () {
    return {
      editMultiple: false,
      dialogForNew: true,
      selectNews: false
    }
  },
  computed: {
    editing () {
      return this.table.editing
    },
    map () {
      return this.$store.state.map.mapObject
    },
    elementsT () {
      return this.$tc('names.element', this.table.visibleSelectedList.length, { count: this.table.visibleSelectedList.length })
    },
    defaultRow () {
      return this.table.defaultRow
    }
  },
  methods: {
    newRow () {
      this.table.makeRows({
        map: this.map,
        editMultiple: this.editMultiple,
        dialogForNew: this.dialogForNew,
        selectNews: this.selectNews
      })
        .catch(this.$except)
    },
    setDefaults () {
      this.$refs.defaultDialog.show()
    },
    stopDrawing () {
      this.$store.dispatch('map/stopDrawing')
    },
    undoSelected () {
      this.$store.dispatch('layout/createDialog', {
        message: this.$t('tools.data.undoConfirmN', { elements: this.elementsT }),
        ok: {
          flat: true,
          label: this.$t('yes')
        },
        cancel: {
          flat: true,
          label: this.$t('no')
        },
        persistent: true
      })
        .then(api => api.onOk(_ => {
          this.table.revertSelected()
        }))
    }
  }
}
</script>
