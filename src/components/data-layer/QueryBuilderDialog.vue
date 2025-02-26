<template>
  <q-dialog v-model="showDialog">
    <q-card class="q-pa-md" style="min-width: 560px">
      <div class="row">
        <div class="text-h6 q-ml-xs">{{ $t('tools.search.queryBuilder.title') }}</div>
        <q-space />
        <q-btn flat dense round icon="close" @click="showDialog = false" />
      </div>
      <div class="q-pt-sm" style="font-size: 11px">
        <span v-html="$t('tools.search.queryBuilder.help')" />
      </div>
      <div class="row q-pt-sm q-pb-xs" >
        <div class="col-6">
          <div class="text-subtitle1 q-py-xs q-ml-xs">
            {{ $t('tools.search.queryBuilder.fields') }}
          </div>
          <div style="height: 226px; overflow-y: auto; border: 1px solid #ccc !important; border-radius: 16px;" class="bg-grey-1 q-mr-xs">
            <q-list
              v-for="field in fields"
              :key="field.name"
              style="min-width: 50px"
              class="text-center"
              dense
            >
              <q-item clickable :class="selectedField.name === field.name && 'bg-blue text-white'">
                <q-item-section @click="clickOnField(field)">{{ field.name }}</q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
        <div class="col-6">
          <div class="text-subtitle1 q-py-xs q-ml-xs">
            {{ $t('tools.search.queryBuilder.values') }}
          </div>
          <div style="height: 226px; overflow-y: auto; border: 1px solid #ccc !important; border-radius: 16px;" class="bg-grey-1">
            <q-list
              v-for="value in values"
              :key="value"
              style="min-width: 50px"
              class="text-left"
              dense
            >
              <q-item clickable :class="selectedValue === value && 'bg-blue text-white'">
                <q-item-section @click="clickOnValue(value)">{{ value }}</q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>
      <div>
        <div class="text-subtitle1 q-pt-sm q-pb-xs q-ml-xs">
          {{ $t('tools.search.queryBuilder.operators') }}
        </div>
        <div class="row">
          <div
            v-for="operator in operators"
            :key="operator"
            class="q-pr-xs"
          >
            <q-btn dense outline @click="selectValue(operator, 'operator')" style="width: 50px;" size="md" color="grey-8">{{ operator }}</q-btn>
          </div>
        </div>
      </div>
      <div class="q-pt-md">
        <q-input dense outlined class="col" v-model="query" placeholder='E.g. "name" = "value" AND ...'>
          <template v-slot:append>
            <q-icon name="close" @click="query = ''" class="cursor-pointer" />
          </template>
        </q-input>
        <q-btn dense outline color="grey-8" :label="$t('tools.search.queryBuilder.addFilter')" @click="addQuery" class="q-px-sm q-mt-sm"/>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { QBtn, QCard, QDialog, QIcon, QItem, QItemSection, QInput, QList, QSpace } from 'quasar'

export default {
  props: ['advancedOption', 'fields', 'show', 'values'],
  components: {
    QBtn,
    QCard,
    QDialog,
    QIcon,
    QItem,
    QItemSection,
    QInput,
    QList,
    QSpace
  },
  data () {
    return {
      clicksField: 0,
      clicksValue: 0,
      query: '',
      operators: [
        '=', '>', '>=', '<', '<=', 'LIKE', 'AND'
      ],
      selectedField: {},
      selectedValue: null
    }
  },
  computed: {
    showDialog: {
      get () {
        return this.show
      },
      set (value) {
        this.$emit('update:show', value)
      }
    }
  },
  methods: {
    selectValue (value, type) {
      if (type === 'value' && !isNaN(value) && !isNaN(parseFloat(value))) {
        this.query += `${value}`
      } else if (['field', 'value'].includes(type)) {
        this.query += `"${value}"`
      } else {
        this.query += ` ${value} `
      }
    },
    addQuery () {
      this.$emit('update:advancedOption', this.query)
      this.$emit('update:show', false)
    },
    clickOnField (field) {
      if (field !== this.selectedField) {
        this.clicksField = 0
        this.selectedField = field
      }
      this.clicksField++
      if (this.clicksField === 1) {
        this.timerField = setTimeout(() => {
          this.clicksField = 0
        }, 700)
      } else {
        this.selectValue(field.name, 'field')
        clearTimeout(this.timerField)
        this.clicksField = 0
      }
    },
    clickOnValue (value) {
      if (value !== this.selectedValue) {
        this.clicksValue = 0
        this.selectedValue = value
      }
      this.clicksValue++
      if (this.clicksValue === 1) {
        this.timerValue = setTimeout(() => {
          this.clicksValue = 0
        }, 700)
      } else {
        this.selectValue(value, 'value')
        clearTimeout(this.timerValue)
        this.clicksValue = 0
      }
    },
    importValues () {
      this.$emit('get-field-values', this.selectedField)
    }
  },
  watch: {
    selectedField () {
      this.importValues()
    },
    show (value) {
      this.query = ''
      this.selectedField = {}
      this.selectedValue = null
    }
  }
}
</script>
