import proj4 from 'proj4'

export function fileToText (file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onerror = reject
    fileReader.onabort = reject
    fileReader.onload = evt => resolve(evt.target.result)
    fileReader.readAsText(file)
  })
}

export async function jsonFileToObject (file) {
  const text = await fileToText(file)
  return JSON.parse(text)
}

export function downloadDXF (data) {
  let link = document.createElement('a')
  link.download = 'geoportal.dxf'
  let blob = new Blob([data], { type: 'text/plain' })
  link.href = window.URL.createObjectURL(blob)
  link.click()
}

export function convertGeoJsonToDXF (data, epsg = 'EPSG:4326') {
  let output = ''

  // Initial info
  output = '999\n'
  output += 'DXF creat des de Mapia (Infraplan)\n'

  // Header DXF (minimal)
  output += '0\n'
  output += 'SECTION\n'
  output += '2\n'
  output += 'ENTITIES\n'

  // Write features
  for (let i = 0; i < data.features.length; i++) {
    output += _convertGeometryToDXF(data.features[i].geometry, epsg)
  }

  // Close section and file
  output += '0\n'
  output += 'ENDSEC\n'
  output += '0\n'
  output += 'EOF'

  return output
}

function _convertGeometryToDXF (geometry, epsg) {
  let output = ''

  // Geometry type
  if (geometry.type === 'Point') {
    output += _convertPoint(geometry.coordinates, epsg)
  } else {
    output += _convertTraversable(geometry.type, geometry.coordinates)
  }

  return output
}

function _convertTraversable (type, coordinates) {
  let output = ''

  // contem quants anidaments d'arrays tenim
  let levels = _nestedArrayCount(coordinates, 0)

  if (type === 'LineString') {
    if (levels === 1) {
      output += _convertCoordArray(false, coordinates)
    } else if (levels > 1) {
      for (let i = 0; i < coordinates.length; i++) {
        output += _convertCoordArray(false, coordinates[i])
      }
    }
  } else if (type === 'Polygon') {
    if (levels === 2) {
      for (let i = 0; i < coordinates.length; i++) {
        output += _convertCoordArray(true, coordinates[i])
      }
    } else if (levels > 2) {
      for (let i = 0; i < coordinates.length; i++) {
        for (let j = 0; j < coordinates[i].length; j++) {
          output += _convertCoordArray(true, coordinates[i][j])
        }
      }
    }
  } else if (type === 'MultiLineString') {
    for (let i = 0; i < coordinates.length; i++) {
      output += _convertCoordArray(false, coordinates[i])
    }
  } else if (type === 'MultiPolygon') {
    for (let i = 0; i < coordinates.length; i++) {
      for (let j = 0; j < coordinates[i].length; j++) {
        output += _convertCoordArray(true, coordinates[i][j])
      }
    }
  }

  return output
}

function _convertCoordArray (isClosed, coordArray, epsg) {
  let output = ''

  // tipus element
  output += '0\n'
  output += 'POLYLINE\n'

  // informació general de l'element
  output += '8\n'
  output += 'Mapia\n'
  output += '62\n'
  output += '1\n'
  output += '66\n'
  output += '1\n'
  output += '10\n'
  output += '0.0\n'
  output += '20\n'
  output += '0.0\n'
  output += '30\n'
  output += '0.0\n'

  // definim polígon o línia
  output += '70\n'
  if (!isClosed) {
    output += '0\n'
  } else {
    output += '1\n'
  }

  for (let i = 0; i < coordArray.length; i++) {
    const altitude = coordArray[i][2]
    const coords = proj4('EPSG:4326', epsg.code, coordArray[i])
    output += '0\n'
    output += 'VERTEX\n'
    output += '8\n'
    output += 'Mapia\n'
    output += '10\n'
    output += coords[0] + '\n'
    output += '20\n'
    output += coords[1] + '\n'
    output += '30\n'

    if (coords.length < 3) {
      output += '0.0\n'
    } else {
      output += altitude + '\n'
    }
  }

  output += '0\n'
  output += 'SEQEND\n'
  return output
}

function _convertPoint (coordinates, epsg) {
  const altitude = (coordinates.length === 3) && coordinates[2]
  let coords = proj4('EPSG:4326', epsg.code, coordinates)
  let output = ''

  output += '0\n'
  output += 'TEXT\n'
  output += '8\n'
  output += 'Mapia\n'
  output += '10\n'
  output += coords[0] + '\n'
  output += '20\n'
  output += coords[1] + '\n'
  output += '30\n'

  if (coords.length < 3) {
    output += '0.0\n'
  } else {
    output += altitude + '\n'
  }

  output += '40\n'
  output += '1\n'
  output += '41\n'
  output += '1\n'
  output += '50\n'
  output += '0\n'
  output += '1\n'
  output += 'X\n'

  return output
}

function _nestedArrayCount (objectArray, startCount) {
  let count = startCount
  if (objectArray.length > 0) {
    if (!Array.isArray(objectArray[0])) { return count }
    count += 1
    return _nestedArrayCount(objectArray[0], count)
  }
  return count
}
