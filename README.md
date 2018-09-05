# SAM-log

[![Greenkeeper badge](https://badges.greenkeeper.io/OmniCar/SAM-log.svg)](https://greenkeeper.io/)

## Usage
The default settings should make sure that no initialisation of the library is needed for Omnicar's applications.
The only **prerequisite** to having the library default to sane environment specific loglevels is having the `NODE_ENV` environment variable available (set to: `production` | `staging` | `development` | `local`)

Another option is to have the `LOG_LEVEL` environment variable available (has to be one of: `error` | `warn` | `info` | `verbose` | `debug` | `silly`) which will set/override the loglevel directly

To use the library, simply import the log function needed. E.g. `logError` and use it like a regular call to `console.error`

It's possible to use an optional prefix for all the logging methods. The available logging methods are:

* `logError(message: string | object, info?: ILogInfo)`
* `logWarn(message: string | object, info?: ILogInfo)`
* `logInfo(message: string | object, info?: ILogInfo)`
* `logVerbose(message: string | object, info?: ILogInfo)`
* `logDebug(message: string | object, info?: ILogInfo)`

## Developing

Pull the project, run `yarn` and you should be good

Before you do a `git push`, please run `yarn tsc-once` to generate the build folder contents

## Testing

There are a bunch of `jest` tests in the `index.test.ts` file. Run `yarn test` to run all tests, `yarn test-watch` to run them in watch-mode, and run `yarn test-debug` to run them in watch mode with `--inspect` enabled (allowing you to step debug)

## Releasing

Releasing a new version is done as a `Github` release.

The `Github` release will automatically trigger a build in `Circle` that publishes the new version to npm 👍