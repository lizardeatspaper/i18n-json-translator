'use strict'

const fs = require('fs')
const path = require('path')
const lib = require('../index')
const { loadJsonFromFile } = require('../helpers')

jest.mock('google-translate', () => () => ({
  translate(string, to, callback) {
    callback(null, { translatedText: `translation for ${string} in ${to} language` })
  }
}))

describe('lib', () => {
  it('does conversion', () => {
    const input = path.resolve(__dirname, 'fixtures/original.json')
    const output = path.resolve(__dirname, 'fixtures/translated.json')

    expect.assertions(1)

    return Promise
      .all([
        loadJsonFromFile(input),
        loadJsonFromFile(output)
      ])
      .then(([inputJson, outputJson]) => {
        return lib({ googleApiKey: 'googleApiKey' })
          .translate(inputJson, { toLanguage: 'cs' })
          .then((result) => expect(result).toMatch(outputJson))
          .catch(fail)
      })
      .catch(fail)
  })
})
