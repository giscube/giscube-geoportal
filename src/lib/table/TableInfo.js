import DottedPath from 'src/lib/DottedPath'
import { buildFields } from 'src/lib/field/index'
import { makeTemplate } from 'src/lib/makeGeoJsonOptions'
import { ForeignKey } from 'src/lib/field'
import { isVoid } from 'src/lib/utils'

import { CircleStyle, ImageStyle, MarkerStyle, PathStyle } from './geom-styles'
import GeomPath from './GeomPath'

export default class TableInfo {
  constructor (info, constFields) {
    this.maxPageSize = info.pagination.max_page_size
    if (typeof this.maxPageSize !== 'number') {
      this.maxPageSize = 1000
    }

    // Fields
    this.fields = buildFields(info, constFields)
    this.fieldsDict = {}
    this.fields.forEach(field => {
      this.fieldsDict[field.name] = field
      if (field.pk) {
        this.pkField = field
      }
    })
    this.fks = this.fields.filter(f => f instanceof ForeignKey)
    this.tableFields = this.strlist2fields(info.design.list_fields)
    this.formFields = this.strlist2fields(info.design.form_fields)
    this.logicFormFields = this.fields.filter(field => field.onUpdate || this.formFields.includes(field))
    {
      const related = new Set()
      this.formFields.forEach(field => {
        if (field.relatedFields) {
          field.relatedFields().forEach(f => related.add(f))
        }
      })
      related.forEach(f => {
        if (!this.logicFormFields.includes(f)) {
          this.logicFormFields.push(f)
        }
      })
    }

    this.rowsPath = new DottedPath(info.objects_path)
    this.propsPath = new DottedPath(info.attributes_path)

    // Geometry info
    this.hasGeom = (
      // Only consider that it has geometry if all the necessary values exist
      info.geom_type &&
      !isVoid(info.geom_path) &&
      info.style && !isVoid(info.style.shapetype) &&
      info.design && !isVoid(info.design.popup) && !isVoid(info.design.tooltip)
    )
    if (this.hasGeom) {
      this.readonlyGeom = false
      this.geomType = info.geom_type.toLowerCase()
      this.geomPath = new DottedPath(info.geom_path)

      this.shapeType = info.style.shapetype.toLowerCase()
      if (this.shapeType === 'image') {
        this.geomStyle = new ImageStyle(info)
      } else if (this.shapeType === 'marker') {
        this.geomStyle = new MarkerStyle(info)
      } else if (this.shapeType === 'circle') {
        this.geomStyle = new CircleStyle(info)
      } else {
        this.geomStyle = new PathStyle(info)
      }
      this.popupTemplate = makeTemplate(info.design.popup)
      this.tooltipTemplate = info.design.tooltip && makeTemplate(info.design.tooltip)
    }

    this.referenceLayers = info.references
  }

  setup (relatedTables) {
    for (let table of relatedTables) {
      const info = table.info
      if (!this.hasGeom && info.hasGeom) {
        this.hasGeom = true
        this.geomPath = new GeomPath(table)
        this.readonlyGeom = true

        this.geomType = info.geomType
        this.shapeType = info.shapeType
        this.geomStyle = info.geomStyle
      }
    }
  }

  strlist2fields (strlist) {
    return strlist
      .split(',')
      .filter(fieldName => fieldName in this.fieldsDict)
      .map(fieldName => this.fieldsDict[fieldName])
  }
}
