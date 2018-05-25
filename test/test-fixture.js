'use strict'

const path = require('path')

const tap = require('tap')
const rimraf = require('rimraf')

const utils = require('./utils')

const exec = utils.exec
const cli = utils.cli
const readTextFile = utils.readTextFile
const readJsonFile = utils.readJsonFile
const writeTextFile = utils.writeTextFile
const fixturePath = path.resolve(__dirname, 'fixture')

let npmi = false
tap.beforeEach(() => {
  if (npmi) return Promise.resolve()
  npmi = true
  return exec('npm', 'i', fixturePath)
})

tap.afterEach(() => {
  return Promise.all(['.next', 'nextoutput', 'next.config.js'].map(dir => {
    return new Promise((resolve, reject) => {
      rimraf(path.resolve(fixturePath, dir), err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }))
})

tap.test('updates .next in cwd by default', t => {
  return exec('npm', 'run build', fixturePath).then(() => {
    return cli('', fixturePath)
  }).then(io => {
    t.notOk(io.err)
    t.notOk(io.stderr)
    t.match(io.stdout, /Build ID: 0123456789abcdef0123456789abcdef01234567/)
    t.match(io.stdout, /Updated:.*BUILD_ID/)
    t.match(io.stdout, /Updated:.*build-stats.json/)
    return readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
  }).then(buildId => {
    t.equal(buildId, '0123456789abcdef0123456789abcdef01234567')
    return readJsonFile(path.resolve(fixturePath, '.next', 'build-stats.json'))
  }).then(stats => {
    t.equal(stats['app.js'].hash, '0123456789abcdef0123456789abcdef01234567')
  })
})

tap.test('supports relative input dir', t => {
  return exec('npm', 'run build', fixturePath).then(() => {
    return cli('fixture')
  }).then(io => {
    t.notOk(io.err)
    t.notOk(io.stderr)
    t.match(io.stdout, /Build ID: 0123456789abcdef0123456789abcdef01234567/)
    t.match(io.stdout, /Updated:.*BUILD_ID/)
    t.match(io.stdout, /Updated:.*build-stats.json/)
    return readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
  }).then(buildId => {
    t.equal(buildId, '0123456789abcdef0123456789abcdef01234567')
    return readJsonFile(path.resolve(fixturePath, '.next', 'build-stats.json'))
  }).then(stats => {
    t.equal(stats['app.js'].hash, '0123456789abcdef0123456789abcdef01234567')
  })
})

tap.test('supports custom --id', t => {
  return exec('npm', 'run build', fixturePath).then(() => {
    return cli('--id abcxyz', fixturePath)
  }).then(io => {
    t.notOk(io.err)
    t.notOk(io.stderr)
    t.match(io.stdout, /Build ID: abcxyz/)
    t.match(io.stdout, /Updated:.*BUILD_ID/)
    t.match(io.stdout, /Updated:.*build-stats.json/)
    return readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
  }).then(buildId => {
    t.equal(buildId, 'abcxyz')
    return readJsonFile(path.resolve(fixturePath, '.next', 'build-stats.json'))
  }).then(stats => {
    t.equal(stats['app.js'].hash, 'abcxyz')
  })
})

tap.test('does not need git with custom --id', t => {
  return exec('npm', 'run build', fixturePath).then(() => {
    return cli('--id 123456', fixturePath, { PATH: '/dne' })
  }).then(io => {
    t.notOk(io.err)
    t.notOk(io.stderr)
    t.match(io.stdout, /Build ID: 123456/)
    t.match(io.stdout, /Updated:.*BUILD_ID/)
    t.match(io.stdout, /Updated:.*build-stats.json/)
    return readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
  }).then(buildId => {
    t.equal(buildId, '123456')
    return readJsonFile(path.resolve(fixturePath, '.next', 'build-stats.json'))
  }).then(stats => {
    t.equal(stats['app.js'].hash, '123456')
  })
})

tap.test('with next.config.js that defines distDir', t => {
  return writeTextFile(path.resolve(fixturePath, 'next.config.js'), `module.exports = { distDir: 'nextoutput' }`)
    .then(() => exec('npm', 'run build', fixturePath))
    .then(() => cli('', fixturePath))
    .then(io => {
      t.notOk(io.err)
      t.notOk(io.stderr)
      t.match(io.stdout, /Build ID: 0123456789abcdef0123456789abcdef01234567/)
      t.match(io.stdout, /Updated:.*BUILD_ID/)
      t.match(io.stdout, /Updated:.*build-stats.json/)
      return readTextFile(path.resolve(fixturePath, 'nextoutput', 'BUILD_ID'))
    })
    .then(buildId => {
      t.equal(buildId, '0123456789abcdef0123456789abcdef01234567')
      return readJsonFile(path.resolve(fixturePath, 'nextoutput', 'build-stats.json'))
    })
    .then(stats => {
      t.equal(stats['app.js'].hash, '0123456789abcdef0123456789abcdef01234567')
    })
})
