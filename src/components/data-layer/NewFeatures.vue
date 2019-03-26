<template>
  <div>
    <data-form-dialog
      :value="popup"
      :fields="$store.getters['dataLayer/fields']"
      :data="popupData"
      @commit="_changeProperties"
      @cancel="_addCurrentFeature"
      @delete="_finish"
    />
  </div>
</template>

<script>
import DataFormDialog from './DataFormDialog'

const EMPTY_FEATURE = { properties: {} }

export default {
  components: {
    DataFormDialog
  },
  props: {
    defaultProperties: {
      type: Object,
      required: true
    },
    editMultiple: {
      type: Boolean,
      required: true
    },
    dialogForNew: {
      type: Boolean,
      required: true
    },
    selectNews: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      popup: false,
      currentFeature: null
    }
  },
  computed: {
    popupData () {
      const feature = this.currentFeature || EMPTY_FEATURE
      return [feature]
    },
    adding: {
      get () {
        return this.$store.state.dataLayer.editStatus.adding
      },
      set (value) {
        this.$store.commit('dataLayer/adding', value)
      }
    }
  },
  methods: {
    start () {
      if (this.adding) {
        return
      }

      // Entire process setup
      this.adding = true

      // Actual start
      this._next()
    },
    _next () {
      // Single feature setup
      this.currentFeature = null
      this.popup = false

      // Draw geometry
      this.$store.dispatch('dataLayer/drawGeometry')
        .then(this._newFeature)
        .catch(error => {
          // `error` will be undefined if it was cancelled and thus not an actual error
          if (error) {
            console.error(error)
          }

          // If there is an error or the person stoped editing, end the creation of new features
          this.end()
        })
    },
    _newFeature (feature) {
      feature.properties = this.defaultProperties
      this.currentFeature = feature

      if (this.dialogForNew) {
        this.popup = true
      } else {
        this._addCurrentFeature()
      }
    },
    _changeProperties (properties) {
      if (properties !== null) {
        this.currentFeature.properties = properties
      }
      this._addCurrentFeature()
    },
    _addCurrentFeature () {
      this.$store.dispatch('dataLayer/addNewFeature', this.currentFeature)
      if (this.selectNews) {
        this.$store.commit('dataLayer/select', [this.currentFeature])
      }
      this._finish()
    },
    _finish () {
      this.popup = false
      if (this.editMultiple) {
        this._next()
      } else {
        this.end()
      }
    },
    end () {
      if (!this.adding) {
        return
      }

      // Cleanup and save the result
      this.$store.dispatch('map/stopDrawing')
      this.popup = false
      this.currentFeature = null
      this.adding = false
    }
  }
}
</script>
