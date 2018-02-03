#!/usr/bin/env node

const program = require('commander')
const pkg = require('../package')

program
  .version(pkg.version)
  .usage('<command> [options]')

program.command('credentials', ' ')
program.command('zones', ' ')
program.command('records', ' ')

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
