<template>
  <q-dialog
    ref="dialog"
    maximized
    :persistent="editing"
  >
    <q-card>
      <q-card-section class="column q-pa-lg">
        <div class="col-auto row items-center justify-end q-mb-md">
          <q-space />
          <status-controls
            class="q-mr-md"
            v-if="table && table.info"
            :table="table"
          />
          <q-btn
            :label="$t('actions.close')"
            :disable="editing || saving"
            @click="hide"
          />
        </div>
        <div class="col-auto row items-center justify-end q-mb-md" v-if="table && table.info">
          <data-edit-controls
            v-if="editing"
            :table="table"
          />
          <data-filter
            v-else
            :table="table"
          />
          <q-space />
        </div>
        <div class="col full-width" v-if="table">
        <data-table
          class="limit-parent"
          v-if="table.info"
          :table="table"
        />
      </div>
        <div v-else>
          <q-spinner size="10vmin" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardSection, QDialog, QSpace } from 'quasar'

import DataEditControls from './DataEditControls'
import DataFilter from './DataFilter'
import DataTable from './DataTable'
import StatusControls from './StatusControls'

export default {
  props: ['table', 'dialogHandlers'],
  components: {
    DataEditControls,
    DataFilter,
    DataTable,
    StatusControls,
    QBtn,
    QCard,
    QCardSection,
    QDialog,
    QSpace
  },
  async mounted () {
    this.dialogHandlers.close = this.close.bind(this)
    await this.$nextTick()
    await this.loadData()
  },
  computed: {
    editing () {
      return this.table && this.table.editing
    },
    saving () {
      return this.table && this.table.saving
    },
    changed () {
      return this.table && this.table.rows.some(row => row.status.new || row.status.edited || row.status.deleted)
    }
  },
  methods: {
    async loadData () {
      try {
        await this.table.fetchInfo()
        await this.table.update({ immediate: true })
      } catch (e) {
        this.$except(e)
      }
    },
    close () {
      const closable = !this.editing && !this.saving
      if (closable) {
        this.hide()
      }
      return closable
    },

    show () {
      this.$refs.dialog.show()
    },
    hide () {
      this.$refs.dialog.hide()
    }
  }
}
</script>

<style scoped>
img {
  display: block;
  margin: auto;
  max-width: 100%;
  max-height: 100%;
  /* auto-grow */
  width: unset;
  height: unset;
}
</style>
