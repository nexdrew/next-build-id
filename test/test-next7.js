const path = require('path')

const tap = require('tap')

const utils = require('./utils')

const exec = utils.exec
const mockedGitEnv = utils.mockedGitEnv
const rmrf = utils.rmrf
const fixturePath = path.resolve(__dirname, 'fixture-next7')

let npmi = false
tap.beforeEach(async () => {
  await rmrf(path.resolve(fixturePath, '.git')) // clean up if test previously failed
  const setup = [exec('cp', '-R dotgit .git', fixturePath)]
  if (!npmi) {
    npmi = true
    setup.push(exec('npm', 'i', fixturePath))
  }
  return Promise.all(setup)
})

tap.afterEach(() => {
  return Promise.all(['.next', '.git'].map(dir => rmrf(path.resolve(fixturePath, dir))))
})

tap.test('async > default', async t => {
  const io = await exec('npm', 'run build', fixturePath)
  t.notOk(io.err)
  t.notOk(io.stderr)

  const buildId = await utils.readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
  t.equal(buildId, '0123456789abcdef0123456789abcdef0123fff7') // file system
})

tap.test('async > describe: true', async t => {
  const io = await exec('npm', 'run build', fixturePath, Object.assign(mockedGitEnv(), { NBI_TEST_DESCRIBE: true }))
  t.notOk(io.err)
  t.notOk(io.stderr)

  const buildId = await utils.readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
  t.equal(buildId, 'v2.0.1-12-g0123456') // mocked git output
})

// *Note* only using mockedGitEnv() here to avoid this error during `npm run build`:
// The node binary used for scripts is /Users/abg/.node-spawn-wrap-98929-a7983ca02859/node
// but npm is using /usr/local/Cellar/node/12.7.0/bin/node itself.
// Use the `--scripts-prepend-node-path` option to include the path for
// the node binary npm was executed with.
tap.test('sync > default', async t => {
  const io = await exec('npm', 'run build', fixturePath, Object.assign(mockedGitEnv(), { NBI_TEST_SYNC: true }))
  t.notOk(io.err)
  t.notOk(io.stderr)

  const buildId = await utils.readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
  t.equal(buildId, '0123456789abcdef0123456789abcdef0123fff7') // file system
})

tap.test('sync > describe: true', async t => {
  const io = await exec('npm', 'run build', fixturePath, Object.assign(mockedGitEnv(), { NBI_TEST_DESCRIBE: true, NBI_TEST_SYNC: true }))
  t.notOk(io.err)
  t.notOk(io.stderr)

  const buildId = await utils.readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
  t.equal(buildId, 'v2.0.1-12-g0123456') // mocked git output
})

tap.test('async > fallback to rev-parse HEAD', async t => {
  await rmrf(path.resolve(fixturePath, '.git', 'refs', 'heads', 'master'))

  const io = await exec('npm', 'run build', fixturePath, mockedGitEnv())
  t.notOk(io.err)
  t.notOk(io.stderr)

  const buildId = await utils.readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
  t.equal(buildId, '0123456789abcdef0123456789abcdef01234567') // mocked git output
})

tap.test('sync > fallback to rev-parse HEAD', async t => {
  await rmrf(path.resolve(fixturePath, '.git', 'refs', 'heads', 'master'))

  const io = await exec('npm', 'run build', fixturePath, Object.assign(mockedGitEnv(), { NBI_TEST_SYNC: true }))
  t.notOk(io.err)
  t.notOk(io.stderr)

  const buildId = await utils.readTextFile(path.resolve(fixturePath, '.next', 'BUILD_ID'))
  t.equal(buildId, '0123456789abcdef0123456789abcdef01234567') // mocked git output
})
