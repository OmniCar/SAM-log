import { transports, createLogger, Logger, format } from 'winston'
import * as Transport from 'winston-transport'
import { LoggingWinston } from '@google-cloud/logging-winston'

export type Environment =
  | 'production'
  | 'staging'
  | 'development'
  | 'local'
  | 'default'

export type Loglevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'

export interface ILogSettings {
  level: Loglevel
  useStackDriver: boolean
  useConsole: boolean
  keyFilename?: string // Service account key file
  projectId?: string // Project id
}

export interface ILogInfo {
  prefix?: string
  meta?: any | any[]
  settings?: Partial<ILogSettings>
}

const allEnvironments: Environment[] = [
  'production',
  'staging',
  'development',
  'local',
  'default',
]

const allLogLevels: Loglevel[] = [
  'error',
  'warn',
  'info',
  'verbose',
  'debug',
  'silly',
]

// This is only for debugging purposes
export let currentSettings: ILogSettings | undefined

/**
 * Validlates a given string against the list of LogLevels
 * @param level The level to check
 */
const isValidLoglevel = (level: string) =>
  allLogLevels.includes(level as Loglevel)

/**
 * Library defaults to fall back to, if no level is provided
 */
const defaultLogLevels: { [key in Environment]: Loglevel } = {
  production: 'info',
  staging: 'verbose',
  development: 'debug',
  local: 'debug',
  default: 'debug',
}

let winstonClient: Logger | undefined

/**
 * Resets the winstonClient and settingsInUse - useful for tests
 */
export function clearLogSettings() {
  winstonClient = undefined
}

/**
 * Returns LogSettings filled with library defaults
 * @param logSettings Incoming settings that will take precedence
 */
export function getLogSettings(
  logSettings?: Partial<ILogSettings>,
): ILogSettings {
  const envLevel =
    process.env.LOG_LEVEL && isValidLoglevel(process.env.LOG_LEVEL)
      ? (process.env.LOG_LEVEL as Loglevel)
      : undefined
  const environment =
    process.env.NODE_ENV &&
    allEnvironments.includes(process.env.NODE_ENV as any)
      ? (process.env.NODE_ENV as Environment)
      : 'default'
  const useStackDriver = environment !== 'local' && environment !== 'default'
  return {
    ...logSettings,
    // 1. Use level from logSettings, 2. Use envLevel, 3. Use environment
    level:
      logSettings && logSettings.level && isValidLoglevel(logSettings.level)
        ? logSettings.level
        : envLevel
        ? envLevel
        : defaultLogLevels[environment],
    useStackDriver:
      logSettings && logSettings.useStackDriver !== undefined
        ? logSettings.useStackDriver
        : useStackDriver,
    // At least one transport must be defined - if no stackdriver we always use consonle
    useConsole: !useStackDriver
      ? true
      : logSettings &&
        logSettings.useConsole !== undefined &&
        logSettings.useConsole
      ? logSettings.useConsole
      : !useStackDriver,
    keyFilename: (logSettings && logSettings.keyFilename) || undefined,
    projectId: (logSettings && logSettings.projectId) || undefined,
  }
}

export function initLogger(logSettings?: Partial<ILogSettings>): Logger {
  const settings = getLogSettings(logSettings)
  const { level, useStackDriver, useConsole, keyFilename, projectId } = settings
  const transportMethods: Transport[] = []
  if (useConsole) {
    transportMethods.push(
      new transports.Console({
        level,
        handleExceptions: true,
        format: format.combine(format.colorize(), format.simple()),
      }),
    )
  }
  if (useStackDriver) {
    transportMethods.push(
      new LoggingWinston({
        level,
        keyFilename,
        projectId,
      }),
    )
  }
  winstonClient = createLogger({
    level,
    transports: transportMethods,
  })
  currentSettings = settings
  return winstonClient
}

// See https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
const replaceErrors = (_key: string, value: any) => {
  if (value instanceof Error) {
    const error: any = {}

    Object.getOwnPropertyNames(value).forEach(function(key: any) {
      error[key] = (value as any)[key]
    })

    return error
  }

  return value
}

export function processMessage(message: string | object, prefix: string = '') {
  let formattedMessage: string
  if (typeof message === 'object') {
    formattedMessage = `${prefix}${JSON.stringify(message, replaceErrors)}`
  }
  formattedMessage = `${prefix}${message}`
  return formattedMessage
  // return formattedMessage.length > 4096
  //   ? `${formattedMessage.substring(0, 4082)} ... truncated`
  //   : formattedMessage
}

const getLogInfo = (info?: ILogInfo): ILogInfo => {
  const defaults = { settings: undefined, prefix: '', meta: undefined }
  return info ? { ...defaults, ...info } : defaults
}

export function log(level: Loglevel, msg: string | object, info?: ILogInfo) {
  const { settings, prefix, meta } = getLogInfo(info)
  const client = initLogger(settings)
  const message = processMessage(msg, prefix)
  client.log({ level, message, meta })
}

/**
 * Logs an error message. `logError` is a convenient and import-friendly alias
 * @param message The message to log
 * @param info Metadata or a prefix
 */
export function logError(message: string | object, info?: ILogInfo) {
  log('error', message, info)
}

/**
 * Logs a warning message
 * @param message The message to log
 * @param info Metadata or a prefix
 */
export function logWarn(message: string | object, info?: ILogInfo) {
  log('warn', message, info)
}

/**
 * Logs an info message
 * @param message The message to log
 * @param info Metadata or a prefix
 */
export function logInfo(message: string | object, info?: ILogInfo) {
  log('info', message, info)
}

/**
 * Logs a verbose message
 * @param message The message to log
 * @param info Metadata or a prefix
 */
export function logVerbose(message: string | object, info?: ILogInfo) {
  log('verbose', message, info)
}

/**
 * Logs a debug message. `logDebug` is a convenient and import-friendly alias
 * @param message The message to log
 * @param info Metadata or a prefix
 */
export function logDebug(message: string | object, info?: ILogInfo) {
  log('debug', message, info)
}
