import { Logger, transports, TransportInstance, LoggerInstance } from 'winston'
import { LoggingWinston } from '@google-cloud/logging-winston'

// @TODO: Put types/interfaces in separate file
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
  settings?: ILogSettings
  prefix?: string
  meta?: any | any[]
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

let winstonClient: LoggerInstance | undefined
let settingsInUse: ILogSettings | undefined

/**
 * Resets the winstonClient and settingsInUse - useful for tests
 */
export function clearLogSettings() {
  winstonClient = undefined
  settingsInUse = undefined
}

export function getCurrentLogSettings() {
  return settingsInUse
}

/**
 * Verifies if the two objects of ILogSettings type are deeply equal
 * @param a First settings object
 * @param b Second settings object
 */
export function areSettingsEqual(
  a: ILogSettings | undefined,
  b: ILogSettings | undefined,
) {
  return a === undefined || b === undefined
    ? a === undefined && b === undefined
    : a.level === b.level &&
        a.useStackDriver === b.useStackDriver &&
        a.useConsole === b.useConsole &&
        a.keyFilename === b.keyFilename &&
        a.projectId === b.projectId
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
    useConsole:
      logSettings && logSettings.useConsole !== undefined
        ? logSettings.useConsole
        : !useStackDriver,
    keyFilename: (logSettings && logSettings.keyFilename) || undefined,
    projectId: (logSettings && logSettings.projectId) || undefined,
  }
}

export function initLogger(
  logSettings?: Partial<ILogSettings>,
): LoggerInstance {
  // The existing client is returned if it exists and settings have not changed
  // or if the settings are undefined
  const settings = getLogSettings(logSettings)
  if (winstonClient && areSettingsEqual(settings, settingsInUse)) {
    return winstonClient
  }
  const { level, useStackDriver, useConsole, keyFilename, projectId } = settings
  const transportMethods: TransportInstance[] = []
  if (useConsole) {
    transportMethods.push(
      new transports.Console({
        level,
        colorize: 'all',
        json: false,
        handleExceptions: true,
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
  winstonClient = new Logger({
    level,
    transports: transportMethods,
  })
  settingsInUse = settings
  return winstonClient
}

function processMessage(message: string | object, prefix: string = '') {
  if (typeof message === 'object') {
    return `${prefix}${JSON.parse(JSON.stringify(message))}`
  }
  return `${prefix}${message}`
}

const getLogInfo = (info?: ILogInfo) => {
  const defaults = { settings: undefined, prefix: '', meta: undefined }
  return info ? { ...defaults, ...info } : defaults
}

/**
 * Logs an error message. `logError` is a convenient and import-friendly alias
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
export function logError(message: string | object, info?: ILogInfo) {
  const { settings, prefix, meta } = getLogInfo(info)
  const client = initLogger(settings || settingsInUse)
  client.error(processMessage(message, prefix), meta)
}

/**
 * Logs a warning message
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
export function logWarn(message: string | object, info?: ILogInfo) {
  const { settings, prefix, meta } = getLogInfo(info)
  const client = initLogger(settings || settingsInUse)
  client.warn(processMessage(message, prefix), meta)
}

/**
 * Logs an info message
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
export function logInfo(message: string | object, info?: ILogInfo) {
  const { settings, prefix, meta } = getLogInfo(info)
  const client = initLogger(settings || settingsInUse)
  client.info(processMessage(message, prefix), meta)
}

/**
 * Logs a verbose message
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
export function logVerbose(message: string | object, info?: ILogInfo) {
  const { settings, prefix, meta } = getLogInfo(info)
  const client = initLogger(settings || settingsInUse)
  client.verbose(processMessage(message, prefix), meta)
}

/**
 * Logs a debug message. `logDebug` is a convenient and import-friendly alias
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
export function logDebug(message: string | object, info?: ILogInfo) {
  const { settings, prefix, meta } = getLogInfo(info)
  const client = initLogger(settings || settingsInUse)
  client.debug(processMessage(message, prefix), meta)
}
