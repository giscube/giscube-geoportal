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
     * [[c] Center](#c-center)
     * [[z] Zoom level](#z-zoom-level)
  * [Types](#types)
     * [Number](#number)
     * [Coordinates](#coordinates)




## Parameters
The parameters follow the URL query format.

The parameters are applied in order but following its behavior:
 - Overrides: Only the last is kept

### [c] Center
Point to center the map to.

  - Type: [Coordinates](#coordinates)
  - Multiple: overrides
  - Example: `c=41.973,2.780`

### [z] Zoom level
The zoom that the map will have.

  - Type: Number
  - Multiple: overrides
  - Example: `z=14`



## Types
### Number
Representation of a number. Use a dot (`.`) as the decimal separator.

Examples:
  - `1`
  - `2`
  - `3.579`

### Coordinates
Representation of map coordinates with coordinate system `EPSG:4326`.

There must be two [numbers](#number) (latitude and longitude) seperated by a comma (`,`).

Examples:
  - `0,0`
  - `41.973,2.780`
