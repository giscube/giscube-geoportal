<template>
  <q-dialog
    type="propt"
    :value="value"
    persistent
    content-class="data-form"
  >
    <q-card class="data-form">
      <q-card-section>
        <data-form
          ref="form"
          :features="features"
          :disable="disable"
          :readonly="readonly"
          @input="onInput"
        />
      </q-card-section>

      <q-card-section v-if="deleted" class="text-negative">
        <q-icon name="warning" class="q-mx-sm" size="1.5em" />
        <span>{{ allDeleted ? (deleted === 1 ? t('thisDeleted') : t('allDeleted')) : t('someDeleted') }}</span>
      </q-card-section>
      <q-card-actions>
        <q-btn
          v-show="!disable && !readonly"
          :label="$t('actions.delete')"
          @click="onDelete"
        />
        <q-space />
        <q-btn
          :label="!disable && !readonly && hasResult ? $t('actions.cancel') : $t('actions.accept')"
          @click="onCancel"
        />
        <q-btn
          v-show="!disable && !readonly && hasResult && !allDeleted"
          :label="$t('actions.apply')"
          @click="onCommit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import DataForm from './DataForm'

export default {
  props: {
    features: {
      type: Array,
      required: true
    },
    disable: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: true
    }
  },
  components: {
    DataForm
  },
  data () {
    return {
      result: {}
    }
  },
  computed: {
    hasResult () {
      return Object.keys(this.result).length > 0
    },
    deleted () {
      return this.features.reduce((accumulated, feature) => {
        return accumulated + (feature.status && feature.status.deleted ? 1 : 0)
      }, 0)
    },
    allDeleted () {
      return this.deleted === this.features.length
    }
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.data.' + key, ...args)
    },
    onInput (value) {
      this.result = value
    },
    _clearData () {
      this.$store.state.dataLayer.layerConfig.fields.forEach(field => {
        if (field.name in this.result) {
          field.setValue({ properties: this.result, value: null })
        }
      })
    },
    onDelete () {
      const deleted = !this.allDeleted
      this.features.forEach(feature => {
        if (feature.status) {
          feature.status.deleted = deleted
        }
      })
    },
    onCancel () {
      this._clearData()
      this.$emit('cancel')
    },
    onCommit () {
      if (this.$refs.form.validate()) {
        this.$emit('commit', this.result)
      } else {
        this.$q.dialog({
          message: this.t('qInvalidCommit'),
          ok: {
            flat: true,
            label: this.$t('yes')
          },
          cancel: {
            flat: true,
            label: this.$t('no')
          },
          persistent: true
        }).onOk(_ => {
          this.$emit('commit', this.result)
        })
      }
    }
  }
}
</script>

<style lang="scss">
.q-dialog.data-form {
  .q-card.data-form {
    width: 70ch;
    max-width: 100%;
    max-height: 100%;
  }
  @media (max-width: 767px) {
    .q-dialog__inner--minimized {
      padding: 10px;
      align-items: start;
    }
  }
}
</style>
