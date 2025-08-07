<template>
    <div class="ocupacio-panel">
        <q-input v-model="beginDate" filled type="date" />
        <q-input v-model="endDate" filled type="date" />
    </div>
</template>

<script>
import { QInput } from 'quasar'

export default {
  name: 'OcupacioPanel',
  components: {
    QInput
  },
  data () {
    return {
      beginDate: '2025-06-07',
      endDate: '2025-06-07'
    }
  }
}
</script>
