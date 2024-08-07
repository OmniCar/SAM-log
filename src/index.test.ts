import {
  getLogSettings,
  initLogger,
  logDebug,
  processMessage,
  lastUsedSettings,
  ILogSettings,
} from './index'

const clearEnv = () => (process.env = {})

const validSettings: ILogSettings = {
  level: 'silly',
  useStackDriver: true,
  useConsole: true,
  keyFilename: 'test',
  projectId: 'test',
}

beforeEach(() => {
  clearEnv()
})

describe('Log settings', () => {
  it('Returns the same valid settings it was given', () => {
    const settings = getLogSettings({ ...validSettings })
    expect(settings).toEqual(validSettings)
  })
  it('Returns modified settings when given invalid settings', () => {
    const invalidSettings: any = {
      level: 'lol',
      useStackDriver: false,
      useConsole: false,
      keyFilename: 'test',
      projectId: 'test',
    }
    const validSettings = {
      ...invalidSettings,
      level: 'debug',
      useConsole: true,
    }
    const settings = getLogSettings(invalidSettings)
    expect(settings).toEqual(validSettings)
  })
  it('Uses the expected loglevel based on process.env.LOG_LEVEL', () => {
    process.env = { ...process.env, LOG_LEVEL: 'silly', NODE_ENV: undefined }
    const settings = getLogSettings()
    expect(settings.level).toEqual('silly')
  })
  it('Uses the expected loglevel based on process.env.NODE_ENV', () => {
    process.env = {
      ...process.env,
      LOG_LEVEL: undefined,
      NODE_ENV: 'production',
    }
    const settings = getLogSettings()
    expect(settings.level).toEqual('info')
    expect(settings.useConsole).toBeFalsy
    expect(settings.useStackDriver).toEqual(true)
  })
})

describe('Log initialization', () => {
  it('Inits the LoggerInstance without any settings and the correct defaults', () => {
    const logger = initLogger()
    expect(Object.keys(logger.transports).length).toEqual(1)
    expect(logger.level).toEqual('debug')
  })
  it('Inits the LoggerInstance with two loggers', () => {
    const logger = initLogger({ useConsole: true, useStackDriver: true })
    expect(Object.keys(logger.transports).length).toEqual(2)
    expect(logger.level).toEqual('debug')
  })
})

describe('Logging methods (except for verbose)', () => {
  it('Verifies that settings are passed through correctly', () => {
    initLogger({ useStackDriver: true })
    const initialSettings: ILogSettings | undefined = { ...lastUsedSettings! }

    logDebug('This is a test', { settings: { useStackDriver: true } })
    const settingsAfterLogging = lastUsedSettings

    // This requires the ignored code 2345 in ts-jest settings
    const equal = areSettingsEqual(initialSettings, settingsAfterLogging)
    expect(equal).toEqual(true)
  })
  it('Checks that an object is stringified correctly', () => {
    const testObject = { test: 'object', value: 4, valid: true }
    const processedMessage = processMessage(testObject)
    expect(processedMessage).toEqual(JSON.stringify(testObject))
  })
  it('Checks that an Error is stringified correctly', () => {
    const error = new Error('This is an error')
    const processedMessage = processMessage(error)
    // '{}' is the default output of JSON.stringify(new Error())
    expect(processedMessage).not.toEqual('{}')
  })
  it('Prints an object without errors', () => {
    const testObject = { test: 'object', value: 4, valid: true }
    logDebug(testObject)
  })
  it('Should use stackdriver in prod', () => {
    process.env = {
      ...process.env,
      LOG_LEVEL: 'silly',
      NODE_ENV: 'production',
    }
    logDebug('This is a test')
    expect(lastUsedSettings!.useStackDriver).toBe(true)
  })
  // @TODO: test settings passed to log functions
  // @TODO: test replacement patterns
})

describe('processMessage', () => {
  const base = '1234567890'
  it('Truncates messages larger that 4K', () => {
    const result = processMessage(base.repeat(500))
    expect(result.length).toBe(4096)
    expect(result).toContain('truncated')
  })
  it('Does not truncate messages smaller than 4K', () => {
    const result = processMessage(base.repeat(400))
    expect(result.length).toBeLessThan(4096)
    expect(result).not.toContain('truncated')
  })
})

/**
 * Verifies if the two objects of ILogSettings type are deeply equal
 * @param a First settings object
 * @param b Second settings object
 */
function areSettingsEqual(
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
