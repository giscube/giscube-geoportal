/* eslint-disable no-undef */
// Disable undef because the linter can't see that _VERSION and _RELEASE will be
//   set by Webpack

const meta = {
  'VERSION': _VERSION,
  'RELEASE': _RELEASE
}

export default meta
export const VERSION = _VERSION
export const RELEASE = _RELEASE
