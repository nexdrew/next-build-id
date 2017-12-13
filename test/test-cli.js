'use strict'

const cp = require('child_process')
const fs = require('fs')
const path = require('path')

const tap = require('tap')
const rimraf = require('rimraf')

const cliPath = path.resolve(__dirname, '..', 'cli.js')
const fixturePath = path.resolve(__dirname, 'fixture')

function exec (file, args, cwd, env, alwaysResolve) {
  return new Promise((resolve, reject) => {
    cp.execFile(file, args.split(/\s/), {
      cwd: cwd || __dirname,
      env: env || Object.assign({}, process.env),
      encoding: 'utf8'
    }, (err, stdout, stderr) => {
      if (err && !alwaysResolve) return reject(err)
      resolve({ err, stdout, stderr })
    })
  })
}

function mockedGitEnv (envPath) {
  const env = Object.assign({}, process.env)
  env.PATH = envPath || [__dirname].concat(env.PATH.split(path.delimiter)).join(path.delimiter)
  return env
}

function cli (args, cwd, envPath) {
  return exec(cliPath, args, cwd, mockedGitEnv(envPath), true)
}

let npmi = false
tap.beforeEach(() => {
  // let setup = Promise.resolve()
  // if (!npmi) {
  //   npmi = true
  //   setup = exec('npm', 'i', fixturePath)
  // }
  // return setup.then(() => exec('npm', 'run build', fixturePath))
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
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(fixturePath, '.next', 'BUILD_ID'), 'utf8', (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }).then(buildId => {
    t.equal(buildId, '0123456789abcdef0123456789abcdef01234567')
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(fixturePath, '.next', 'build-stats.json'), 'utf8', (err, data) => {
        if (err) return reject(err)
        resolve(JSON.parse(data))
      })
    })
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
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(fixturePath, '.next', 'BUILD_ID'), 'utf8', (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }).then(buildId => {
    t.equal(buildId, '0123456789abcdef0123456789abcdef01234567')
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(fixturePath, '.next', 'build-stats.json'), 'utf8', (err, data) => {
        if (err) return reject(err)
        resolve(JSON.parse(data))
      })
    })
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
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(fixturePath, '.next', 'BUILD_ID'), 'utf8', (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }).then(buildId => {
    t.equal(buildId, 'abcxyz')
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(fixturePath, '.next', 'build-stats.json'), 'utf8', (err, data) => {
        if (err) return reject(err)
        resolve(JSON.parse(data))
      })
    })
  }).then(stats => {
    t.equal(stats['app.js'].hash, 'abcxyz')
  })
})

tap.test('with next.config.js that defines distDir', t => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(fixturePath, 'next.config.js'), `module.exports = { distDir: 'nextoutput' }`, error => {
      if (error) return reject(error)
      resolve()
    })
  }).then(() => exec('npm', 'run build', fixturePath)).then(() => {
    return cli('', fixturePath)
  }).then(io => {
    t.notOk(io.err)
    t.notOk(io.stderr)
    t.match(io.stdout, /Build ID: 0123456789abcdef0123456789abcdef01234567/)
    t.match(io.stdout, /Updated:.*BUILD_ID/)
    t.match(io.stdout, /Updated:.*build-stats.json/)
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(fixturePath, 'nextoutput', 'BUILD_ID'), 'utf8', (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }).then(buildId => {
    t.equal(buildId, '0123456789abcdef0123456789abcdef01234567')
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(fixturePath, 'nextoutput', 'build-stats.json'), 'utf8', (err, data) => {
        if (err) return reject(err)
        resolve(JSON.parse(data))
      })
    })
  }).then(stats => {
    t.equal(stats['app.js'].hash, '0123456789abcdef0123456789abcdef01234567')
  })
})

tap.test('errs on invalid json', t => {
  const fixture2Path = path.resolve(__dirname, 'fixture2')
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(fixture2Path, '.next', 'BUILD_ID'), '', error => {
      if (error) return reject(error)
      resolve()
    })
  }).then(() => cli('', fixture2Path)).then(io => {
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
