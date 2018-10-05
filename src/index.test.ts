import {
  getLogSettings,
  ILogSettings,
  logError,
  clearLogSettings,
  logWarn,
  logInfo,
  initLogger,
  logDebug,
  areSettingsEqual,
  getCurrentLogSettings,
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
  clearLogSettings()
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
    const validSettings = { ...invalidSettings, level: 'debug' }
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
describe('Settings equality', () => {
  it('Returns true for two undefined objects', () => {
    const equal = areSettingsEqual(undefined, undefined)
    expect(equal).toEqual(true)
  })
  it('Returns false when only one object is undefined', () => {
    const equal = areSettingsEqual({ ...validSettings }, undefined)
    expect(equal).toBeFalsy
  })
  it('Returns true when objects are alike', () => {
    const settingsA: ILogSettings = {
      level: 'silly',
      useStackDriver: true,
      useConsole: true,
      keyFilename: 'test',
      projectId: 'test',
    }
    const settingsB = { ...settingsA }
    const equal = areSettingsEqual(settingsA, settingsB)
    expect(equal).toEqual(true)
  })
  it('Returns false when objects are not alike', () => {
    const settingsA: ILogSettings = {
      level: 'silly',
      useStackDriver: true,
      useConsole: true,
      keyFilename: 'test',
      projectId: 'test',
    }
    const eq1 = areSettingsEqual(settingsA, {
      ...settingsA,
      useStackDriver: false,
    })
    expect(eq1).toBeFalsy
    const eq2 = areSettingsEqual(settingsA, { ...settingsA, useConsole: false })
    expect(eq2).toBeFalsy
    const eq3 = areSettingsEqual(settingsA, { ...settingsA, level: 'debug' })
    expect(eq3).toBeFalsy
    const eq4 = areSettingsEqual(settingsA, {
      ...settingsA,
      keyFilename: 'another test',
    })
    expect(eq4).toBeFalsy
    const eq5 = areSettingsEqual(settingsA, {
      ...settingsA,
      projectId: 'another test',
    })
    expect(eq5).toBeFalsy
  })
})
describe('Logging methods (except for verbose)', () => {
  it('Verifies that error is called', () => {
    const logger = initLogger()
    const spy = jest.spyOn(logger, 'log')
    logError('This is a test')
    expect(spy).toHaveBeenCalledTimes(1)
  })
  it('Verifies that warn is called', () => {
    const logger = initLogger()
    const spy = jest.spyOn(logger, 'log')
    logWarn('This is a test')
    expect(spy).toHaveBeenCalledTimes(1)
  })
  it('Verifies that info is called', () => {
    const logger = initLogger()
    const spy = jest.spyOn(logger, 'log')
    logInfo('This is a test')
    expect(spy).toHaveBeenCalledTimes(1)
  })
  it('Verifies that debug is called', () => {
    const logger = initLogger()
    const spy = jest.spyOn(logger, 'log')
    logDebug('This is a test')
    expect(spy).toHaveBeenCalledTimes(1)
  })
  it('Verifies that settings are not affected by logging', () => {
    initLogger({ useStackDriver: true })
    const initialSettings = { ...getCurrentLogSettings() }
    logDebug('This is a test')
    const settingsAfterLogging = getCurrentLogSettings()
    // This requires the ignored code 2345 in ts-jest settings
    const equal = areSettingsEqual(initialSettings, settingsAfterLogging)
    expect(equal).toEqual(true)
  })
  // @TODO: test settings passed to log functions
  // @TODO: test replacement patterns
})
