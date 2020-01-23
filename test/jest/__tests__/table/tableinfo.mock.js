export default Object.freeze({
  name: 'test',
  title: 'Test',
  description: 'A mock for testing',
  keywords: null,
  pk_field: 'id',
  fields: [
    {
      name: 'id',
      label: null,
      search: true,
      fullsearch: true,
      readonly: false,
      null: false,
      blank: true,
      size: null,
      decimals: null,
      widget: 'number'
    },
    {
      name: 'a',
      label: null,
      search: true,
      fullsearch: true,
      readonly: false,
      null: true,
      blank: true,
      size: null,
      decimals: 0,
      widget: 'number'
    },
    {
      name: 'b',
      label: null,
      search: true,
      fullsearch: true,
      readonly: false,
      null: true,
      blank: true,
      size: null,
      decimals: 0,
      widget: 'number'
    },
    {
      name: 'c',
      label: null,
      search: true,
      fullsearch: true,
      readonly: false,
      null: true,
      blank: true,
      size: null,
      decimals: 0,
      widget: 'number'
    },
    {
      name: 'd',
      label: null,
      search: true,
      fullsearch: true,
      readonly: false,
      null: true,
      blank: true,
      size: null,
      decimals: 0,
      widget: 'number'
    }
  ],
  virtual_fields: [],
  references: [],
  pagination: {
    page_size: 50,
    max_page_size: 1000
  },
  design: {
    list_fields: '',
    form_fields: ''
  },
  geom_type: null,
  objects_path: 'data',
  attributes_path: null
})
