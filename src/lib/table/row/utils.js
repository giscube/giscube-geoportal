function getChangedFields (fields, a, b) {
  return fields
    .filter(field => !field.constant && !field.virtual && !field.equals({ properties: a }, { properties: b }))
    .map(field => field.name)
}

export function mergeRowsData (fields, targets, update) {
  // fields => array of fileds that we want to merge
  // targets => array of cascading data that want to update. ie [server, consolidated, current]
  // update => data to apply

  // Remove duplicated objects. We only need to apply it once.
  targets = targets.filter((properties, index) => properties !== targets[index - 1])

  // Detect what fields for what properties changed
  const toForward = new Set(getChangedFields(fields, targets[0], update))
  let changedFields = fields.filter(field => toForward.has(field.name))
  const changes = targets.map((properties, index) => {
    // Remove fields that have been changed so it will not forward the value
    // The first should always change for the new values
    if (index !== 0) {
      const changed = getChangedFields(changedFields, targets[index], targets[index - 1])
      for (let name of changed) {
        toForward.delete(name)
      }
      changedFields = fields.filter(field => toForward.has(field.name))
    }
    return [ properties, changedFields ]
  })

  // Update all the properties
  changes.forEach(([ properties, changedFields ]) => {
    changedFields.forEach(field => {
      field.setValue({ properties, value: field.getValue({ properties: update }) })
    })
  })
}
