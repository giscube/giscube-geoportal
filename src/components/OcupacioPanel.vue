<template>
  <div class="panel">
    <div class="panel-content">
      <div class="panel-title">Ocupació Via Pública</div>
      <div>
        <p>
          Consulta les dades d'ocupació de la via pública al municipi de Sant Cugat del Vallès.
        </p>
        <p>
          Selecciona el rang de dates que vols consultar i prem "Actualitza" per veure els talls al mapa.
          Per consultar només un dia fes click dues vegades a la mateixa data.
        </p>
        <div style="padding: 12px; padding-top: 15px;!important padding-bottom: -5px;!important border-radius: 25px;">
        </div>
        <div v-show="isAuthenticated" class="q-pb-sm">
          <div><q-toggle v-model="tallsExt" label="Talls (extern)" color="warning" keep-color /></div>
          <div><q-toggle v-model="tallsInt" label="Talls (intern)" color="red" keep-color /></div>
          <div><q-toggle v-model="assabentatsInt" label="Assabentats (intern)" color="blue" keep-color /></div>
        </div>
      </div>
      <div>
        <q-date v-model="selectedDates" range mask="DD/MM/YYYY"/>
      </div>
      <div class="q-py-sm">
        <q-btn label="Actualitza" color="primary" @click="updateTalls" :loading="loading" :disable="!selectedDates">
          <q-tooltip v-if="!selectedDates">
            Selecciona una data
          </q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { QBtn, QDate, QTooltip, QToggle } from 'quasar'

export default {
  name: 'OcupacioPanel',
  components: {
    QBtn,
    QDate,
    QTooltip,
    QToggle
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      const today = new Date()
      vm.selectedDates = today.toJSON().slice(0, 10).split('-').reverse().join('/')
    })
  },
  data () {
    return {
      selectedDates: {
        from: null,
        to: null
      }
    }
  },
  computed: {
    apiKey () {
      return this.$store.state.ocupacio.token
    },
    loading () {
      return this.$store.state.ocupacio && this.$store.state.ocupacio.loading
    },
    isAuthenticated () {
      return this.$store.state.auth.accessToken
    }
  },
  methods: {
    updateOcupacio () {
      const date1 = this.selectedDates.from || this.selectedDates
      const date2 = this.selectedDates.to || this.selectedDates
      this.$store.dispatch('obres/updateOcupacio', {
        url: 'https://aupacaux.apps.santcugat.cat/api/GetOvpGeomByDates?geoque=LINES',
        apiKey: this.apiKey,
        date1,
        date2
      })
    }
  }
}
</script>
