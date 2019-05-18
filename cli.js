#!/usr/bin/env node

const fs = require('fs')
const meow = require('meow')
const chalk = require('chalk')
const { loadJsonFromFile, writeJsonToFile } = require('./helpers')

const cli = meow(`
  Usage
    $ i18n-json-translator en.json --to=cs --prev-version=cs.json --google-api-key=AIzaSyCslhGRPMznAx6g0FWfW21zQwADYK4v5zw
    
  Options
    --to  Target language
    --prev-version, -p  Path to the previous version of this translation. Keys that have been already translated won't be translated again. 
    --google-api-key, -k  Google API key used for translation
`, {
  autoHelp: true,
  autoVersion: true,
  flags: {
    to: {
      type: 'string'
    },
    prevVersion: {
      type: 'string',
      alias: 'p'
    },
    googleApiKey: {
      type: 'string',
      alias: 'k'
    }
  }
})

if (cli.input.length !== 1) {
  console.error(chalk.red('Missing:', chalk.underline.bold('input file.')))
  cli.showHelp(1)
} else {
  if (!fs.existsSync(cli.input[0])) {
    console.error(chalk.red('File does not exist:', chalk.underline.bold(cli.input[0])))
    cli.showHelp(1)
  }
}

if (typeof cli.flags.to === 'undefined') {
  console.error(chalk.red('Required:', chalk.underline.bold('--to argument.')))
  cli.showHelp(1)
}

if (typeof cli.flags.googleApiKey === 'undefined') {
  console.error(chalk.red('Required:', chalk.underline.bold('--google-api-key argument.')))
  cli.showHelp(1)
}

if (typeof cli.flags.prevVersion !== 'undefined' && !fs.existsSync(cli.flags.prevVersion)) {
  console.error(chalk.red('File does not exist:', chalk.underline.bold(cli.input[0])))
  cli.showHelp(1)
}

const { translate } = require('.')({ googleApiKey: cli.flags.googleApiKey })

Promise.all([
  loadJsonFromFile(cli.input[0]),
  cli.flags.prevVersion ? loadJsonFromFile(cli.flags.prevVersion) : Promise.resolve(undefined)
]).then(([from, prevVersion]) => {
  return translate(from, { toLanguage: cli.flags.to, prevVersion })
    .then(result => writeJsonToFile(result, `${cli.flags.to}.json`))
    .then(() => void console.log(chalk.green('Successfully translated.')))
    .catch(error => void console.error(chalk.red('Error: ', error)))
})
