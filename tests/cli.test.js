'use strict'

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

describe('cli', () => {
  const cli = path.resolve(__dirname, '../cli.js')
  const input = path.resolve(__dirname, 'fixtures/original.json')

  const googleApiKey = '--google-api-key=GOOGLE_API_KEY'
  const toLanguage = '--to=cs'

  it('does conversion', (done) => {
    exec(`${cli} ${input} ${googleApiKey} ${toLanguage}`, (error, stdout, stderr) => {
      expect(error).toBeNull()
      expect(stderr).toBe('')
      expect(stdout).toBe('')
      done()
    })
  })
})
