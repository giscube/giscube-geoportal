<template>
  <div>
    <q-btn
      v-show="table && !table.editing"
      :label="t('edit')"
      @click="startEditing"
    />
    <q-btn-group
      v-show="table && table.editing"
    >
      <q-btn
        :label="dataChanged ? $t('actions.discard') : $t('actions.cancel')"
        @click="discard"
      />
      <q-btn
        v-if="dataChanged"
        :label="$t('actions.save')"
        icon="save"
        @click="save"
      />
    </q-btn-group>
  </div>
</template>

<script>
import { QBtn, QBtnGroup } from 'quasar'
import TranslationMixin from './TranslationMixin'

export default {
  mixins: [TranslationMixin],
  props: ['table'],
  components: {
    QBtn,
    QBtnGroup
  },
  computed: {
    editing () {
      return this.table.editing
    },
    dataChanged () {
      return this.table && this.table.changedCount > 0
    }
  },
  methods: {
    async _stopDrawing () {
      this.$store.dispatch('map/stopDrawing')
      await this.$nextTick()
    },
    async startEditing () {
      await this._stopDrawing()
      this.table.startEditing()
    },
    async discard () {
      await this._stopDrawing()
      this.table.discard()
    },
    async save () {
      await this._stopDrawing()
      this.table.save()
    }
  }
}
</script>
