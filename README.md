# next-build-id

> Override `next build` output to use a consistent build id

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

This module exports a single function that accepts an options object and returns a `Promise` which, once resolved, indicates a successful overwrite with the id value used.

```js
const nextBuildId = require('next-build-id')

nextBuildId().then(result => console.log('success!'))
```

## Reference

- [zeit/next.js#2978 (comment)](https://github.com/zeit/next.js/issues/2978#issuecomment-334849384)
- [zeit/next.js#3299 (comment)](https://github.com/zeit/next.js/issues/3299#issuecomment-344973091)
- ["Handle BUILD_ID Mismatch Error" on Next.js wiki](https://github.com/zeit/next.js/wiki/Handle-BUILD_ID-Mismatch-Error)
