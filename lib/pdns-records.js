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

program
  .version(pkg.version)
  .usage('<command> [options]')

async function loadZone (zone) {
  if (!isNaN(zone)) {
    return { id: zone }
  }

  const spinner = ora('Fetching zone information...').start()

  const zones = await apiHelper.getZones()
        .catch((err) => {
          spinner.stop()
          console.error(err.message)
          return []
        })

  if (!zones.length) return

  spinner.stop()

  if (!zone) {
    const answers = await inquirer.prompt([{
      type: 'list',
      name: 'zone',
      message: 'Select a zone',
      choices: zones.map((z) => ({ name: z.name, value: z.id }))
    }])

    return { id: answers.zone }
  }

  return zones.find((z) => z.name.startsWith(zone))
}

async function loadRecords (zone) {
  const spinner = ora('Fetching records...').start()

  const records = await apiHelper.getRecords(zone.id)
        .catch((err) => {
          spinner.stop()
          console.error(err.message)
          return []
        })

  spinner.stop()

  return records
}

program.command('list [zone]')
  .action(async (zone) => {
    const dnsZone = await loadZone(zone)
    if (!dnsZone) return

    const records = (await loadRecords(dnsZone))
          .map((r) => ({
            id: r.id,
            type: r.record_type,
            name: r.name,
            data: r.data,
            ttl: r.ttl
          }))

    return console.log(columnify(records, {
      truncate: true,
      config: {
        data: { maxWidth: 80 }
      }
    }))
  })

program.command('delete [zone]')
  .action(async (zone) => {
    const dnsZone = await loadZone(zone)
    if (!dnsZone) return

    const records = await loadRecords(dnsZone)

    if (!records.length) {
      return console.log(`No records found in zone ${dnsZone.name || dnsZone.id}`)
    }

    const { recordIds } = await inquirer.prompt([{
      type: 'checkbox',
      message: 'Select records to delete',
      name: 'recordIds',
      choices: records.map((r) => ({
        name: `${r.record_type} ${r.name} ${r.data.substr(0, 40)}${r.data.length > 40 ? '...' : ''}`,
        value: r.id
      }))
    }])

    if (!recordIds.length) return

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      default: false,
      message: `Confirm deleting ${recordIds.length} records from zone ${dnsZone.name || dnsZone.id}?`
    }])

    return confirm &&
      apiHelper.deleteRecords(dnsZone.id, recordIds)
        .catch((err) => console.error(err.message))
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
