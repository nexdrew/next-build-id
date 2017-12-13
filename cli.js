#!/usr/bin/env node
'use strict'

const path = require('path')

require('sywac')
  .positional('[dir]', {
    paramsDesc: 'The directory containing the Next.js app'
  })
  .string('-i, --id <string>', { desc: 'Specify the build id to use' })
  .help('-h, --help', { implicitCommand: false })
  .version('-v, --version', { implicitCommand: false })
  .outputSettings({ maxWidth: 60 })
  .parseAndExit()
  .then(argv => {
    argv.dir = path.resolve(process.cwd(), argv.dir || '.')
    const nextBuildId = require('./index')
    return nextBuildId(argv)
  })
  .then(result => {
    // if (!result.id || !result.files.length) {
    //   console.error(result.id ? 'Could not find files to update' : 'Could not determine build id')
    //   process.exitCode = 1
    //   return
    // }
    console.log(`Build ID: ${result.id}`)
    result.files.forEach(file => console.log(` Updated: ${path.relative(process.cwd(), file)}`))
  })
  .catch(err => {
    if (typeof err === 'string') console.error(err)
    else console.error('Unexpected error:', err)
    process.exitCode = 1
  })
