const path = require('path')

const tap = require('tap')
const rimraf = require('rimraf')

const utils = require('./utils')

const exec = utils.exec
const mockedGitEnv = utils.mockedGitEnv
const fixturePath = path.resolve(__dirname, 'fixture-next6')

let npmi = false
tap.beforeEach(() => {
  if (npmi) return Promise.resolve()
  npmi = true
  return exec('npm', 'i', fixturePath)
})

tap.afterEach(() => {
  return Promise.all(['.next'].map(dir => {
    return new Promise((resolve, reject) => {
      rimraf(path.resolve(fixturePath, dir), err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }))
})

tap.test('with next.config.js that uses a generateBuildId function', t => {
  return exec('npm', 'run build', fixturePath, mockedGitEnv())
    .then(io => {
      t.notOk(io.err)
      t.notOk(io.stderr)
      return utils.readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
    })
    .then(buildId => {
      t.equal(buildId, '0123456789abcdef0123456789abcdef01234567')
    })
})

tap.test('call stupid default generateBuildId for code coverage', t => {
  return exec('npm', 'run build', fixturePath, mockedGitEnv())
    .then(() => {
      return exec(path.resolve(__dirname, '..', 'cli.js'), '', fixturePath, Object.assign(mockedGitEnv(), { NBI_TEST_CALL_DEFAULT_GENERATEBUILDID: true }))
    })
    .then(io => {
      t.notOk(io.err)
      t.notOk(io.stderr)
      t.match(io.stdout, /9f2a37be-4545-445e-91bd/)
      t.match(io.stdout, /Build ID: 0123456789abcdef0123456789abcdef01234567/)
      t.match(io.stdout, /Updated:.*BUILD_ID/)
      return utils.readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
    })
    .then(buildId => {
      t.equal(buildId, '0123456789abcdef0123456789abcdef01234567')
    })
})
