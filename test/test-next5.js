const path = require('path')

const tap = require('tap')
const rimraf = require('rimraf')

const utils = require('./utils')

const exec = utils.exec
const cli = utils.cli
const readTextFile = utils.readTextFile
const fixturePath = path.resolve(__dirname, 'fixture-next5')

let npmi = false
tap.beforeEach(() => {
  if (npmi) return Promise.resolve()
  npmi = true
  return exec('npm', 'i', fixturePath)
})

tap.afterEach(() => {
  return Promise.all(['build'].map(dir => {
    return new Promise((resolve, reject) => {
      rimraf(path.resolve(fixturePath, dir), err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }))
})

tap.test('with next.config.js that exports a function', t => {
  return exec('npm', 'run build', fixturePath).then(() => {
    return cli('', fixturePath)
  }).then(io => {
    t.notOk(io.err)
    t.notOk(io.stderr)
    t.match(io.stdout, /Build ID: 0123456789abcdef0123456789abcdef01234567/)
    t.match(io.stdout, /Updated:.*BUILD_ID/)
    return readTextFile(path.resolve(fixturePath, 'build', 'BUILD_ID'))
  }).then(buildId => {
    t.equal(buildId, '0123456789abcdef0123456789abcdef01234567')
  })
})
