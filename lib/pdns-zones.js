#!/usr/bin/env node

const program = require('commander')
const inquirer = require('inquirer')
const Configstore = require('configstore')
const chalk = require('chalk')
const PointDNS = require('pointdns')
const columnify = require('columnify')
const ora = require('ora')

const pkg = require('../package')
const apiHelper = require('./api-helper')

async function loadZones () {
  const spinner = ora('Fetching zone information...').start()

  const zones = await apiHelper.getZones()
        .catch((err) => {
          spinner.stop()
          console.error(err.message)
          return []
        })

  spinner.stop()

  return zones
}

program
  .version(pkg.version)
  .usage('<command> [options]')

program.command('list')
  .action(async () => {
    const zones = await loadZones()

    if (!zones.length) return

    const columns = zones
          .map((z) => ({
            id: z.id,
            name: z.name,
            group: z.group || chalk.gray('null')
          }))

    console.log(columnify(columns))
  })

program.command('delete')
  .action(async () => {
    const zones = await loadZones()

    const { zoneIds } = await inquirer.prompt([{
      type: 'checkbox',
      message: 'Select zones to delete',
      name: 'zoneIds',
      choices: zones.map((z) => ({
        name: z.name,
        value: z.id
      }))
    }])

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      default: false,
      message: `Confirm deleting ${zoneIds.length} zones?`
    }])

    return confirm &&
      apiHelper.deleteZones(zoneIds)
        .catch((err) => console.log(err.message))
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
