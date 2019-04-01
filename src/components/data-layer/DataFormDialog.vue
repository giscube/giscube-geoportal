<template>
  <q-dialog
    type="propt"
    :value="value"
    persistent
  >
    <q-card style="min-width: 70ch; max-height: 100%">
      <q-card-section>
        <data-form
          ref="form"
          :features="features"
          :disable="disable"
          :readonly="readonly"
          @input="onInput"
        />
      </q-card-section>

      <q-card-actions>
        <q-btn
          :label="$t('delete')"
          @click="$emit('delete')"
        />
        <q-space />
        <q-btn
          :label="$t('cancel')"
          @click="$emit('cancel')"
        />
        <q-btn
          v-show="!disable && !readonly && result"
          :label="$t('ok')"
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
      result: null
    }
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.data.' + key, ...args)
    },
    onInput (value) {
      this.result = value
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
