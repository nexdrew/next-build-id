# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/nexdrew/next-build-id/compare/v2.0.1...v3.0.0) (2019-08-16)


### ⚠ BREAKING CHANGES

* Drops support for Next<6 and Node<8 (now using `async`/`await`), changes return value from object to string (to be more compatible with `generateBuildId`), removes hacky file overwriting and thus the CLI (file overwriting is no longer necessary for modern versions of Next).

See README for further details.

### Features

* add sync function, return string, add describe option, remove cli ([#23](https://github.com/nexdrew/next-build-id/issues/23)) ([5621290](https://github.com/nexdrew/next-build-id/commit/5621290))

<a name="2.0.1"></a>
## [2.0.1](https://github.com/nexdrew/next-build-id/compare/v2.0.0...v2.0.1) (2018-05-25)


### Bug Fixes

* look for .git dir in parents of input dir ([#7](https://github.com/nexdrew/next-build-id/issues/7)) ([bcc374b](https://github.com/nexdrew/next-build-id/commit/bcc374b))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/nexdrew/next-build-id/compare/v1.2.0...v2.0.0) (2018-05-25)


### Features

* use next-build-id as module within Next 6 generateBuildId function ([#6](https://github.com/nexdrew/next-build-id/issues/6)) ([502bccc](https://github.com/nexdrew/next-build-id/commit/502bccc))


### BREAKING CHANGES

* The next-build-id CLI has not changed, but module usage will no longer manually overwrite a BUILD_ID file unless a `write: true` option is given, so that the module can be used within generateBuildId from next.config.js to just lookup the current git commit hash.



<a name="1.2.0"></a>
# [1.2.0](https://github.com/nexdrew/next-build-id/compare/v1.1.0...v1.2.0) (2018-05-24)


### Features

* support Next.js v5 and "config as a function" ([#5](https://github.com/nexdrew/next-build-id/issues/5)) ([2b02037](https://github.com/nexdrew/next-build-id/commit/2b02037))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/nexdrew/next-build-id/compare/v1.0.0...v1.1.0) (2018-04-08)


### Features

* support git version <= 1.8.4 ([#2](https://github.com/nexdrew/next-build-id/issues/2)) ([2724677](https://github.com/nexdrew/next-build-id/commit/2724677))



<a name="1.0.0"></a>
# 1.0.0 (2017-12-13)


### Features

* initial code ([3872c83](https://github.com/nexdrew/next-build-id/commit/3872c83))
