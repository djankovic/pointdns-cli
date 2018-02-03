#!/usr/bin/env node

const program = require('commander')
const inquirer = require('inquirer')
const pkg = require('../package')
const chalk = require('chalk')

const config = require('./config')

const validators = {
  required: (value) => !!value.length || 'This field is required.'
}

async function findCredentials (username) {
  const credentials = config.get('credentials') || []

  if (!username) {
    const answers = await inquirer.prompt([{
      type: 'list',
      name: 'username',
      message: 'Username',
      choices: credentials.map((c) => c.username)
    }])

    username = answers.username
  }

  return credentials.find((c) => c.username === username)
}

program
  .version(pkg.version)
  .usage('<command> [options]')

program.command('add')
  .description('Add new credentials')
  .action(() => {
    return inquirer.prompt([{
      name: 'description',
      type: 'input',
      message: 'Description',
      default: 'optional'
    }, {
      name: 'username',
      type: 'input',
      message: 'Username or email',
      default: 'required',
      validate: validators.required
    }, {
      name: 'apitoken',
      type: 'password',
      message: 'API token',
      default: 'required',
      validate: validators.required
    }])
    .then((answers) => {
      const credentials = config.get('credentials') || []
      config.set('credentials', credentials.concat({
        ...answers,
        isDefault: !credentials.length
      }))
    })
  })

program.command('list')
  .description('List saved credentials')
  .action(() => {
    const credentials = config.get('credentials') || []

    return credentials.forEach((c) => {
      console.log(`${c.isDefault ? chalk.green('✓ ') : '  '}${c.username} ${chalk.gray(c.description || '')}`)
    })
  })

program.command('set [username]')
  .description('Set default credentials')
  .action(async (username) => {
    const credentials = config.get('credentials') || []

    if (!credentials.length) {
      return console.warn('No saved credentials')
    }

    const selectedCredentials = await findCredentials(username)

    return config.set('credentials', credentials.map((c) => ({
      ...c,
      isDefault: c.username === selectedCredentials.username
    })))
  })

program.command('remove [username]')
  .description('Remove credentials')
  .action(async (username) => {
    const selectedCredentials = await findCredentials(username)

    const credentials = config.get('credentials')
          .filter((c) => c.username !== selectedCredentials.username)

    if (credentials.length && selectedCredentials.isDefault) {
      credentials[0].isDefault = true
    }

    config.set('credentials', credentials)
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
