<template>
  <div class="panel help-panel">
    <div class="panel-content">
      <p class="panel-title">{{ t('title') }}</p>
      <div class="help-button"><q-btn outline @click="tourStart" :label="t('start')" /></div>
    </div>
  </div>
</template>

<script>
import { QBtn } from 'quasar'
import Shepherd from 'shepherd.js'

require('shepherd.js/dist/css/shepherd-theme-square-dark.css')

export default {
  name: 'HelpPanel',
  components: {
    QBtn
  },
  data () {
    return {
      tour: null
    }
  },
  mounted () {
    this.tour = new Shepherd.Tour()

    const steps = []
    this.$config.layout.headerToolbar.forEach(toolName => {
      if (!toolName.startsWith('-') && this.$te(`tools.${toolName}.help`)) {
        steps.push([toolName, {
          title: this.$te(`tools.${toolName}.title`) ? this.$t(`tools.${toolName}.title`) : this.$t(`tools.${toolName}.headerName`),
          text: this.$t(`tools.${toolName}.help`),
          attachTo: `.header-tools-${toolName} bottom`
        }])
      }
    })

    steps.push(['layers', {
      title: 'Capes',
      text: 'Llistat de capes. Podeu canviar la capa base, activar i desactivar les capes, esborrar-les del mapa, etc.',
      attachTo: '.giscube-layers-control left'
    }])
    steps.push(['zoom', {
      title: 'Control de zoom',
      text: 'Feu servir aquests botons per canviar el zoom del mapa. També podeu fer servir els dits si esteu en un dispositiu tàctil.',
      attachTo: '.leaflet-control-zoom left'
    }])

    const last = steps.length - 1
    steps.forEach(([name, config], i) => {
      const buttons = []
      if (i === 0) {
        buttons.push({
          text: this.$t('actions.close'),
          classes: 'shepherd-button-secondary',
          action: this.tour.cancel
        })
      } else {
        buttons.push({
          text: this.$t('actions.previous'),
          action: this.tour.back
        })
      }
      if (i === last) {
        buttons.push({
          text: this.$t('actions.close'),
          action: this.tour.cancel
        })
      } else {
        buttons.push({
          text: this.$t('actions.next'),
          action: this.tour.next
        })
      }
      config.buttons = buttons

      // Add to the tour
      this.tour.addStep(name, config)
    })
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.help.' + key, ...args)
    },
    tourStart () {
      this.tour.start()
    }
  }
}
</script>

<style>
.shepherd-title {
  line-height: unset;
}
.tippy-popper[x-placement^="bottom"] {
  margin-top: 0;
}
.tippy-popper[x-placement^="left"] {
  margin-right: 0;
}
</style>
