<template>
  <q-dialog
    ref="dialog"
    maximized
    persistent
    no-route-dismiss
    @hide="$emit('hide')"
    @show="onShow"
  >
    <q-card>
      <q-card-section class="q-pa-lg column no-wrap data-table-dialog-contents" v-show="visible">
        <div class="col-auto row items-center justify-end space-items-md">
          <status-controls
            v-if="table && table.info"
            :table="table"
          />
          <q-btn
            :label="$t('actions.close')"
            :disable="editing || saving"
            @click="hide"
          />
        </div>
        <div class="col-auto row items-center" v-if="table.info">
          <data-edit-controls
            v-if="editing"
            :table="table"
          />
          <data-filter
            v-else
            :table="table"
          />
        </div>
        <div class="col full-width">
          <data-table
            class="limit-parent"
            v-if="table.info"
            :table="table"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QCardSection, QDialog } from 'quasar'

import DataEditControls from './DataEditControls'
import DataFilter from './DataFilter'
import DataTable from './DataTable'
import StatusControls from './StatusControls'

export default {
  props: {
    table: {
      type: Object,
      required: true
    },
    dialogHandlers: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    DataEditControls,
    DataFilter,
    DataTable,
    StatusControls,
    QBtn,
    QCard,
    QCardSection,
    QDialog
  },
  data () {
    return {
      visible: false
    }
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
    onShow () {
      this.visible = true
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
<style lang="stylus">
.data-table-dialog-contents > :not(:last-child)
  margin-bottom: $spaces.md.y

</style>
