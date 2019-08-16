'use strict'

const cp = require('child_process')
const fs = require('fs')
const path = require('path')

const rimraf = require('rimraf')

function exec (file, args, cwd, env, alwaysResolve) {
  // console.error(`\nexec: ${file} ${args}`)
  return new Promise((resolve, reject) => {
    cp.execFile(file, args.split(/\s/), {
      cwd: cwd || __dirname,
      env: env || Object.assign({}, process.env),
      encoding: 'utf8'
    }, (err, stdout, stderr) => {
      // console.error(`done: ${file} ${args}`)
      if (err && !alwaysResolve) return reject(err)
      resolve({ err, stdout, stderr })
    })
  })
}

function mockedGitEnv (env) {
  env = env || {}
  if (!env.PATH) env.PATH = [__dirname].concat(process.env.PATH.split(path.delimiter)).join(path.delimiter)
  return Object.assign({}, process.env, env)
}

function rmrf (dirOrFile) {
  return new Promise((resolve, reject) => {
    rimraf(dirOrFile, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function readTextFile (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

// function writeTextFile (file, data) {
//   return new Promise((resolve, reject) => {
//     fs.writeFile(file, data, error => {
//       if (error) return reject(error)
//       resolve()
//     })
//   })
// }

module.exports = {
  exec,
  mockedGitEnv,
  rmrf,
  readTextFile
}
