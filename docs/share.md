# Share specification
This specification shows how to share a map view

The link must follow this format:
`/share/?<parameters>`




## Table of Contents
  <!--
  TOC generated with gh-md-toc (https://github.com/ekalinin/github-markdown-toc)
  `cat docs/share.md | ~/gh-md-toc -`
  -->
  * [Table of Contents](#table-of-contents)
  * [Parameters](#parameters)
     * [[b] Base map](#b-base-map)
     * [[c] Center](#c-center)
     * [[g] Geometry](#g-geometry)
     * [[m] Message](#m-message)
     * [[l] Layers](#l-layers)
     * [[o] Options](#o-options)
     * [[z] Zoom level](#z-zoom-level)
  * [Types](#types)
     * [BaseMap](#basemap)
     * [Coordinates](#coordinates)
     * [Flags](#flags)
     * [Geometry](#geometry)
     * [List (T, s)](#list-t-s)
     * [Number](#number)
     * [String](#string)



## Parameters
The parameters follow the URL query format.

The parameters are applied in order but following its behavior:
  - Merges: Shallow merge of both objects
  - Overrides: Only the last is kept

### [b] Base map
Which layer is being used as a base layer.
 - Type: [BaseMap](#basemap)
 - Multiple: overrides
 - Example: `b=cEE1`

### [c] Center
Point to center the map to.

  - Type: [Coordinates](#coordinates)
  - Multiple: overrides
  - Example: `c=41.973,2.780`

### [g] Geometry
Geometry to be added to the map.

  - Type: [List](#list)([Geometry](#geometry), `:`)
  - Multiple: overrides
  - Example: `g=m41.973,2.780:l41.973,2.780;41.973,2.6;42,2.6`

### [m] Message
Message to share it with.

  - Type: [String](#string)
  - Multiple: overrides
  - Example: `m=This%20is%20the%20special%20point`

### [l] Layer results
Message to share it with.

  - Type: [List](#list)([Result](#result), `;`)
  - Multiple: overrides
  - Example: `l=c12.4,15.3;g20.8`

### [o] Options
Option flags.

  - Type: [Flags](#flags)
  - Multiple: merges
  - Example: `o=mc,om`

List of flags:
  - `om` (open message): If the message should be automatically opened
  - `mc` (marker at the center): If a marker should be added at the center of the shared view.

### [z] Zoom level
The zoom that the map will have.

  - Type: [Number](#number)
  - Multiple: overrides
  - Example: `z=14`



## Types
### BaseMap
Representation of the selected base map. The first 3 characters are the base64 representation of the CRC16-IBM of its url. The rest is base 16 representation of the index (zero based) that it should be found on.

Example:
 - `cEE1`(`cEE` is the CRC16-IBM and `1` the index of the second map)

### Coordinates
Representation of map coordinates with coordinate system `EPSG:4326`.

There must be two [numbers](#number) (latitude and longitude) seperated by a comma (`,`).

Examples:
  - `0,0`
  - `41.973,2.780`

### Flags
Representation of a list of flags. Each flag needs to be part of the regex `\w` metacharacter. They are separated by any separator except `&` (because is used to split the parameters). Usually comma (`,`) is used.

They may be restricted to a list.

Examples:
 - `a,b,c,d`

### Geometry
Representation of a geometry. It contains the type and the list of coordinates separated by semicolon (`;`): `<type><list (Coordinates, ';')>`

Types:
 - `m`: Marker
 - `l`: Line
 - `p`: Polygon

Examples:
 - `m41.973,2.780`
 - `l41.973,2.780;41.973,2.6;42,2.6`

### List (T, s)
Representation of list of type `T` with spacer `s`. `s` should not be used by `T`.

### Number
Representation of a number. Use a dot (`.`) as the decimal separator.

Examples:
  - `1`
  - `2`
  - `3.579`

### Result
Representation of a result. First character specifies its type. Then it's followed by its reference followed by `:` and its opacity. If `:` and/or opacity are omited, the default opacity is 1.

Types:
 - `c`: [Coordinates](#coordinates)
 - `g`: Geoportal ID ([String](#string))

Examples:
 - `c24.5,24.3`
 - `c24.5,24.3:0.34`
 - `g20.1`
 - `g20.1:0.75`


### String
URL encoded string.

Examples:
 - `foo`
 - `This%20is%20URL%20encoded`
