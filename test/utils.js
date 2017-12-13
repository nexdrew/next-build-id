'use strict'

const cp = require('child_process')
const fs = require('fs')
const path = require('path')

const cliPath = path.resolve(__dirname, '..', 'cli.js')

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

function mockedGitEnv (envPath) {
  const env = Object.assign({}, process.env)
  env.PATH = envPath || [__dirname].concat(env.PATH.split(path.delimiter)).join(path.delimiter)
  return env
}

function cli (args, cwd, envPath) {
  return exec(cliPath, args, cwd, mockedGitEnv(envPath), true)
}

function readTextFile (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

function readJsonFile (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) return reject(err)
      resolve(JSON.parse(data))
    })
  })
}

function writeTextFile (file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, error => {
      if (error) return reject(error)
      resolve()
    })
  })
}

module.exports = {
  exec,
  cli,
  readTextFile,
  readJsonFile,
  writeTextFile
}
