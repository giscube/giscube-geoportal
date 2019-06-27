import { config, i18n } from 'src/lib.js'
import Options from 'src/lib/options'

describe('Check lib.js', () => {
  it('has a mergable config', () => {
    expect(config).toBeInstanceOf(Options)
  })
  it('has a mergable i18n', () => {
    expect(i18n).toBeInstanceOf(Options)
  })
})
