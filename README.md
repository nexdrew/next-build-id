# next-build-id

> Use a consistent, git-based build id for your Next.js app

[![Build Status](https://travis-ci.org/nexdrew/next-build-id.svg?branch=master)](https://travis-ci.org/nexdrew/next-build-id)
[![Coverage Status](https://coveralls.io/repos/github/nexdrew/next-build-id/badge.svg?branch=master)](https://coveralls.io/github/nexdrew/next-build-id?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Greenkeeper badge](https://badges.greenkeeper.io/nexdrew/next-build-id.svg)](https://greenkeeper.io/)

Small package to generate a consistent, git-based build id for your Next.js app when running `next build` on each server in a multi-server deployment.

This module exports a function that you can use as your [generateBuildId](https://github.com/zeit/next.js#configuring-the-build-id) config option in next.config.js.

By default, it will use the latest git commit hash from the local git repository (equivalent of `git rev-parse HEAD`):

```js
// next.config.js
const nextBuildId = require('next-build-id')
module.exports = {
  generateBuildId: () => nextBuildId({ dir: __dirname })
}
// => 'f9fc968afa249d162c924a8d5b4ce6562c164c2e'
```

If you'd rather use a build id relative to the most recent tag in your git repo, pass `describe: true` as an option and the output of `git describe --tags` will be used instead:

```js
// next.config.js
const nextBuildId = require('next-build-id')
module.exports = {
  generateBuildId: () => nextBuildId({ dir: __dirname, describe: true })
}
// => 'v1.0.0' (no changes since v1.0.0 tag)
// => 'v1.0.0-19-ga8f7eee' (19 changes since v1.0.0 tag)
```

This module also exposes a synchronous version for custom needs, e.g. passing the build id directly to a Sentry configuration. Just call `nextBuildId.sync({ dir: __dirname })` instead.

## Why?

If you're running multiple instances of your app sitting behind a load balancer without session affinity (and you're building your app directly on each production server instead of pre-packaging it), a tool like this is necessary to avoid Next.js errors like ["invalid build file hash"](https://github.com/zeit/next.js/blob/52ccc14059673508803f96ef1c74eecdf27fe096/server/index.js#L444), which happens when the same client (browser code) talks to multiple server backends (Node server) that have different build ids.

The build id used by your app is stored on the file system in a `BUILD_ID` text file in your build directory, which is `.next` by default.

## Install

```console
$ npm i next-build-id
```

## API

This module exports two functions, one that is asynchronous (`nextBuildId()` primary export) and one that is synchronous (`nextBuildId.sync()`). Both functions accept a single options object, supporting the same options listed below. Both functions return (or resolve to) a string, representing the git-based build id.

The options supported are:

- `dir` (string, default `process.cwd()`): a directory within the local git repository

    Using `__dirname` from your next.config.js module is generally safe. The default value is assumed to be the directory from which you are running the `next build` command, but this may not be correct based on how you build your Next.js app.

- `describe` (boolean, default `false`): use git tag description instead of latest commit sha

    Specify this as `true` to use `git describe --tags` instead of `git rev-parse HEAD` for generating the build id. If there are no tags in your local git repository, the latest commit sha will be used instead, unless you also specify `fallbackToSha: false`.

- `fallbackToSha` (boolean, default `true`): fallback to latest commit sha when `describe: true` and no tags exist

    Only applies when using `describe: true`. If you want to be strict about requiring the use (and presence) of tags, then disable this with `fallbackToSha: false`, in which case an error will be thrown if no tags exist.

Note that this module really provides a generic way to get an id or status string for any local git repository, meaning it is not directly tied to Next.js in any way - it just depends on how you use it.

## Reference

- [zeit/next.js#786](https://github.com/zeit/next.js/issues/786)
- [zeit/next.js#2978 (comment)](https://github.com/zeit/next.js/issues/2978#issuecomment-334849384)
- [zeit/next.js#3299 (comment)](https://github.com/zeit/next.js/issues/3299#issuecomment-344973091)
- ["Handle BUILD_ID Mismatch Error" on Next.js wiki](https://github.com/zeit/next.js/wiki/Handle-BUILD_ID-Mismatch-Error)

## License

ISC © Andrew Goode
