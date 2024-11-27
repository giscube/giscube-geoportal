<template>
  <div class="panel">
    <div class="panel-content">
        <q-toolbar>
          <q-toolbar-title>{{ $t('tools.criminal.headerName') }}</q-toolbar-title>
          <q-btn flat round icon="las la-info-circle" @click="redirectInfo" />
        </q-toolbar>
        <div class="q-pa-sm">
          <q-select
            v-model="penalCode"
            :options="penalCodeOptions"
            label="Títol Codi Penal:"
          />
          <q-select
            v-model="factType"
            :options="factTypeOptions"
            label="Tipus de fets:"
          />
          <div class="q-pt-md">
            <q-badge color="secondary">
              Any: {{ year }}
            </q-badge>
            <q-slider
              v-model="year"
              marker-labels
              :min="2013"
              :max="2023"
              color="grey"
              track-color="grey"
              inner-track-color="transparent"
              selection-color="transparent"
              markers
            />
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import { QSelect, QSlider, QToolbarTitle, QToolbar, QBtn } from 'quasar'

export default {
  components: {
    QSelect,
    QSlider,
    QToolbarTitle,
    QToolbar,
    QBtn
  },
  data () {
    return {
      factType: null,
      factTypeOptions: [
        'De la usurpació de l\'estat civil',
        'Falsedats documentals'
      ],
      penalCode: null,
      penalCodeOptions: [
        'De les falsedats', 'De les lesions'
      ],
      year: null
    }
  }
}

</script>

<style>
</style>
