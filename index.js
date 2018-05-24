'use strict'

const fs = require('fs')
const path = require('path')

const buildIdFiles = ['BUILD_ID', 'build-stats.json']

// from https://github.com/zeit/next.js/blob/canary/server/config.js
const defaultConfig = {
  webpack: null,
  webpackDevMiddleware: null,
  poweredByHeader: true,
  distDir: '.next',
  assetPrefix: '',
  configOrigin: 'default',
  useFileSystemPublicRoutes: true,
  generateBuildId: () => '9f2a37be-4545-445e-91bd-' + String(new Date().getTime()).slice(1, 13),
  generateEtags: true,
  pageExtensions: ['jsx', 'js']
}

module.exports = function nextBuildId (opts) {
  // TODO support opts.conf object similar to next(opts) ??
  opts = opts || {}
  const result = {}
  return resolveInputDir(opts.dir)
    .then(inputDir => {
      result.inputDir = inputDir
      return opts.write && resolveOutputDir(inputDir)
    })
    .then(outputDir => {
      result.outputDir = outputDir || null
      return opts.write && getFiles(outputDir)
    })
    .then(files => {
      result.files = files || null
      return determineBuildId(opts.id, result.inputDir)
    })
    .then(id => {
      result.id = id
      return opts.write && updateFiles(id, result.files)
    })
    .then(() => result)
}

/* eslint-disable prefer-promise-reject-errors */
function resolveInputDir (dir) {
  let inputDir = dir || '.'
  if (!path.isAbsolute(inputDir)) inputDir = path.resolve(path.dirname(require.main.filename), inputDir)
  if (!fs.existsSync(inputDir)) return Promise.reject(`Input directory does not exist: ${inputDir}`)
  return Promise.resolve(inputDir)
}

function resolveOutputDir (inputDir) {
  let outputDir = defaultConfig.distDir
  const nextConfigFile = path.join(inputDir, 'next.config.js')
  // avoid slow require if file doesn't exist where it should
  if (fs.existsSync(nextConfigFile)) {
    try {
      const userConfigModule = require(nextConfigFile)
      let userConfig = userConfigModule.default || userConfigModule
      if (typeof userConfigModule === 'function') {
        userConfig = userConfigModule('phase-production-build', { defaultConfig })
      }
      if (userConfig && userConfig.distDir) outputDir = userConfig.distDir
    } catch (e) {}
  }
  outputDir = path.resolve(inputDir, outputDir)
  if (!fs.existsSync(outputDir)) return Promise.reject(`Output directory does not exist: ${outputDir}`)
  return Promise.resolve(outputDir)
}

function getFiles (outputDir) {
  const files = buildIdFiles.map(file => {
    file = path.join(outputDir, file)
    return fs.existsSync(file) ? file : null
  }).filter(Boolean)
  if (!files.length) return Promise.reject(`Could not find ${buildIdFiles.join(' or ')} in output directory: ${outputDir}`)
  return Promise.resolve(files)
}

function determineBuildId (id, inputDir) {
  if (id) return Promise.resolve(id)
  return new Promise((resolve, reject) => {
    const cp = require('child_process')
    cp.execFile('git', [`--git-dir=${inputDir}/.git`, `--work-tree=${inputDir}`, 'rev-parse', 'HEAD'], (err, stdout, stderr) => {
      if (err) return reject(err)
      if (stderr) return reject(String(stderr).trim())
      if (stdout) return resolve(String(stdout).trim())
      reject(`No output from command: git --git-dir=${inputDir}/.git --work-tree=${inputDir} rev-parse HEAD`)
    })
  })
}

function updateFiles (id, files) {
  return Promise.all(files.map(file => {
    return path.extname(file) === '.json' ? updateJsonFile(id, file) : updateTextFile(id, file)
  }))
}

function updateJsonFile (id, file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) return reject(err)
      let write = false
      let json
      try {
        json = JSON.parse(data)
      } catch (e) {
        return reject(e)
      }
      Object.keys(json).forEach(key => {
        if (json[key] && json[key].hash) {
          write = true
          json[key].hash = id
        }
      })
      if (!write) return reject(`No hash values found in ${file}`)
      fs.writeFile(file, JSON.stringify(json), error => {
        if (error) return reject(error)
        resolve()
      })
    })
  })
}

function updateTextFile (id, file) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, id, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}
/* eslint-enable prefer-promise-reject-errors */
