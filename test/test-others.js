'use strict'

const path = require('path')

const tap = require('tap')

const utils = require('./utils')

const cli = utils.cli
const writeTextFile = utils.writeTextFile

tap.test('errs on invalid json', t => {
  const fixture2Path = path.resolve(__dirname, 'fixture2')
  return writeTextFile(path.resolve(fixture2Path, '.next', 'BUILD_ID'), '')
    .then(() => cli('', fixture2Path))
    .then(io => {
      t.equal(io.err.code, 1)
      t.match(io.stderr, /Unexpected error/)
      t.notOk(io.stdout)
    })
})

tap.test('errs on no git output', t => {
  return cli('', path.resolve(__dirname, 'fixture3')).then(io => {
    t.equal(io.err.code, 1)
    t.match(io.stderr, /No output from command: git/)
    t.notOk(io.stdout)
  })
})

tap.test('errs without --id and without git', t => {
  return cli('', path.resolve(__dirname, 'fixture3'), '/dne').then(io => {
    t.equal(io.err.code, 1)
    t.match(io.stderr, /Unexpected error/)
    t.notOk(io.stdout)
  })
})
