<template>
  <div
    v-show="editing"
    class="row items-center"
  >
    <q-btn-group class="q-mr-sm">
      <q-btn
        :label="t('newElement')"
        :disable="saving"
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
      :label="t('editElements', {elements: $tc('names.element', table.visibleSelectedList.length, {count: table.visibleSelectedList.length})})"
      :disable="saving"
      @click="table.uiEditSelected()"
    >
      <q-list>
        <q-item
          clickable
          v-close-popup
          @click="table.deleteSelected()"
        >
          <q-item-section>
            <q-item-label>{{ t('deleteElements', {elements: $tc('names.element', table.visibleSelectedList.length, {count: table.visibleSelectedList.length})}) }}</q-item-label>
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

import { CancelError } from 'src/lib/utils'

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
      defaultRow: this.table.newRow(),
      editMultiple: false,
      dialogForNew: true,
      selectNews: false
    }
  },
  computed: {
    editing () {
      return this.table.editing
    },
    saving () {
      return this.table.saving
    },
    map () {
      return this.$store.state.map.mapObject
    }
  },
  methods: {
    newRow () {
      this.table.makeRows({
        map: this.map,
        base: this.defaultRow,
        editMultiple: this.editMultiple,
        dialogForNew: this.dialogForNew,
        selectNews: this.selectNews
      })
        .catch(e => {
          if (e instanceof CancelError) {
            // Do nothing, allow to cancel when drawing
          } else {
            this.$except(e)
          }
        })
    },
    setDefaults () {
      this.$refs.defaultDialog.show()
    },
    stopDrawing () {
      this.$store.dispatch('map/stopDrawing')
    }
  }
}
</script>
