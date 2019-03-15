<template>
  <q-dialog
    type="propt"
    :value="value"
    persistent
  >
    <q-card style="min-width: 70ch">
      <q-card-section>
        <data-form
          :fields="fields"
          :data="data"
          :disable="disable"
          :readonly="readonly"
          @change="result = $event"
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
          v-show="!disable && !readonly"
          :label="$t('ok')"
          @click="$emit('commit', result)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import DataForm from './DataForm'

export default {
  props: {
    fields: {
      type: Array,
      required: true
    },
    data: {
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
  }
}
</script>
