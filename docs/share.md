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
     * [[m] Message](#m-message)
     * [[o] Options](#o-options)
     * [[z] Zoom level](#z-zoom-level)
  * [Types](#types)
     * [Coordinates](#coordinates)
     * [Flags](#flags)
     * [Number](#number)
     * [String](#string)



## Parameters
The parameters follow the URL query format.

The parameters are applied in order but following its behavior:
  - Merges: Shallow merge of both objects
  - Overrides: Only the last is kept

### [c] Center
Point to center the map to.

  - Type: [Coordinates](#coordinates)
  - Multiple: overrides
  - Example: `c=41.973,2.780`

### [m] Message
Message to share it with.

  - Type: [String](#string)
  - Multiple: overrides
  - Example: `m=This%20is%20the%20special%20point`

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

### Number
Representation of a number. Use a dot (`.`) as the decimal separator.

Examples:
  - `1`
  - `2`
  - `3.579`

### String
URL encoded string.

Examples:
 - `foo`
 - `This%20is%20URL%20encoded`
