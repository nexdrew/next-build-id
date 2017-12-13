# next-build-id

> Override `next build` output to use a consistent build id

[![Build Status](https://travis-ci.org/nexdrew/next-build-id.svg?branch=master)](https://travis-ci.org/nexdrew/next-build-id)
[![Coverage Status](https://coveralls.io/repos/github/nexdrew/next-build-id/badge.svg?branch=master)](https://coveralls.io/github/nexdrew/next-build-id?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Simple CLI and module that lets you define your own build id when using Next.js.

This is necessary if you're running multiple instances of your Next.js app on different servers sitting behind a load balancer without session affinity. Otherwise, if your Next.js builds end up with different build ids, a client loading content from different servers can result in [this Next.js error](https://github.com/zeit/next.js/blob/52ccc14059673508803f96ef1c74eecdf27fe096/server/index.js#L444), which causes the app to blow up for that client.

This module updates/overrides the following:

- uuid defined in `.next/BUILD_ID`
- hashes for all chunks defined in `.next/build-stats.json`

By default, this CLI/module will overwrite those values with the hash of the latest git commit (`git rev-parse HEAD`), but it will also allow you to define your own id.

If you have `distDir` defined in a `next.config.js` file, it will be respected. Otherwise, this module assumes the Next.js build output is in a relative `.next` directory.

## Install

```console
$ npm i --save next-build-id
```

## CLI Usage

Modify your build script to run `next-build-id` after `next build` (only needed for production builds).

For instance, if you have an npm run script in package.json that looks like this:

```json
{
  "scripts": {
    "build": "next build"
  }
}
```

You can change it to this:

```json
{
  "scripts": {
    "build": "next build && next-build-id"
  }
}
```

The above example will use the hash of the latest git commit as the build id. If you'd like to define your own build id, pass it to the CLI using the `--id` flag:

```json
{
  "scripts": {
    "build": "next build && next-build-id --id $MY_CUSTOM_ID"
  }
}
```

If you are building a directory other than the project root, you can pass that as an argument, just like you do with `next build`:

```json
{
  "scripts": {
    "build": "next build client && next-build-id client"
  }
}
```

## Module Usage

This module exports a single function that accepts an options object and returns a `Promise`.

The options supported are:

- `dir` (string): the directory built by `next build`
- `id` (string): define a custom id instead of deferring to `git rev-parse HEAD`

The returned `Promise` resolves to a result object containing:

- `inputDir` (string): the resolved path of the Next.js app
- `outputDir` (string): the resolved path of the `next build` output
- `id` (string): the build id used
- `files` (array of strings): resolved paths of each file updated with the build id

Example:

```js
const nextBuildId = require('next-build-id')

const opts = {}
// opts.dir = '/path/to/input/dir'
// opts.id = 'my_custom_id'

nextBuildId(opts).then(result => {
  console.log('success!')
  console.log('input dir:', result.inputDir)
  console.log('output dir:', result.outputDir)
  console.log('build id:', result.id)
  console.log('updated files:', result.files)
}).catch(err => {
  console.error('you broke it', err)
})
```

## Reference

- [zeit/next.js#2978 (comment)](https://github.com/zeit/next.js/issues/2978#issuecomment-334849384)
- [zeit/next.js#3299 (comment)](https://github.com/zeit/next.js/issues/3299#issuecomment-344973091)
- ["Handle BUILD_ID Mismatch Error" on Next.js wiki](https://github.com/zeit/next.js/wiki/Handle-BUILD_ID-Mismatch-Error)

## License

ISC © Andrew Goode
