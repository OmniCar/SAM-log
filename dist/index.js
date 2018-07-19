"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var winston_1 = require("winston");
var logging_winston_1 = require("@google-cloud/logging-winston");
var allEnvironments = [
    'production',
    'staging',
    'development',
    'local',
    'default',
];
var allLogLevels = [
    'error',
    'warn',
    'info',
    'verbose',
    'debug',
    'silly',
];
/**
 * Validlates a given string against the list of LogLevels
 * @param level The level to check
 */
var isValidLoglevel = function (level) {
    return allLogLevels.includes(level);
};
/**
 * Library defaults to fall back to, if no level is provided
 */
var defaultLogLevels = {
    production: 'info',
    staging: 'verbose',
    development: 'debug',
    local: 'debug',
    default: 'debug',
};
var winstonClient;
var settingsInUse;
/**
 * Resets the winstonClient and settingsInUse - useful for tests
 */
function clearLogSettings() {
    winstonClient = undefined;
    settingsInUse = undefined;
}
exports.clearLogSettings = clearLogSettings;
function getCurrentLogSettings() {
    return settingsInUse;
}
exports.getCurrentLogSettings = getCurrentLogSettings;
/**
 * Verifies if the two objects of ILogSettings type are deeply equal
 * @param a First settings object
 * @param b Second settings object
 */
function areSettingsEqual(a, b) {
    return a === undefined || b === undefined
        ? a === undefined && b === undefined
        : a.level === b.level &&
            a.useStackDriver === b.useStackDriver &&
            a.useConsole === b.useConsole &&
            a.keyFilename === b.keyFilename &&
            a.projectId === b.projectId;
}
exports.areSettingsEqual = areSettingsEqual;
/**
 * Returns LogSettings filled with library defaults
 * @param logSettings Incoming settings that will take precedence
 */
function getLogSettings(logSettings) {
    var envLevel = process.env.LOG_LEVEL && isValidLoglevel(process.env.LOG_LEVEL)
        ? process.env.LOG_LEVEL
        : undefined;
    var environment = process.env.NODE_ENV &&
        allEnvironments.includes(process.env.NODE_ENV)
        ? process.env.NODE_ENV
        : 'default';
    var useStackDriver = environment !== 'local' && environment !== 'default';
    return tslib_1.__assign({}, logSettings, { 
        // 1. Use level from logSettings, 2. Use envLevel, 3. Use environment
        level: logSettings && logSettings.level && isValidLoglevel(logSettings.level)
            ? logSettings.level
            : envLevel
                ? envLevel
                : defaultLogLevels[environment], useStackDriver: logSettings && logSettings.useStackDriver !== undefined
            ? logSettings.useStackDriver
            : useStackDriver, useConsole: logSettings && logSettings.useConsole !== undefined
            ? logSettings.useConsole
            : !useStackDriver, keyFilename: (logSettings && logSettings.keyFilename) || undefined, projectId: (logSettings && logSettings.projectId) || undefined });
}
exports.getLogSettings = getLogSettings;
function initLogger(logSettings) {
    // The existing client is returned if it exists and settings have not changed
    // or if the settings are undefined
    var settings = getLogSettings(logSettings);
    if (winstonClient && areSettingsEqual(settings, settingsInUse)) {
        return winstonClient;
    }
    var level = settings.level, useStackDriver = settings.useStackDriver, useConsole = settings.useConsole, keyFilename = settings.keyFilename, projectId = settings.projectId;
    var transportMethods = [];
    if (useConsole) {
        transportMethods.push(new winston_1.transports.Console({
            level: level,
            colorize: 'all',
            json: false,
            handleExceptions: true,
        }));
    }
    if (useStackDriver) {
        transportMethods.push(new logging_winston_1.LoggingWinston({
            level: level,
            keyFilename: keyFilename,
            projectId: projectId,
        }));
    }
    winstonClient = new winston_1.Logger({
        level: level,
        transports: transportMethods,
    });
    settingsInUse = settings;
    return winstonClient;
}
exports.initLogger = initLogger;
function processMessage(message, prefix) {
    if (prefix === void 0) { prefix = ''; }
    if (typeof message === 'object') {
        return "" + prefix + JSON.parse(JSON.stringify(message));
    }
    return "" + prefix + message;
}
var getLogInfo = function (info) {
    var defaults = { settings: undefined, prefix: '', meta: undefined };
    return info ? tslib_1.__assign({}, defaults, info) : defaults;
};
/**
 * Logs an error message. `logError` is a convenient and import-friendly alias
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
function logError(message, info) {
    var _a = getLogInfo(info), settings = _a.settings, prefix = _a.prefix, meta = _a.meta;
    var client = initLogger(settings || settingsInUse);
    client.error(processMessage(message, prefix), meta);
}
exports.logError = logError;
/**
 * Logs a warning message
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
function logWarn(message, info) {
    var _a = getLogInfo(info), settings = _a.settings, prefix = _a.prefix, meta = _a.meta;
    var client = initLogger(settings || settingsInUse);
    client.warn(processMessage(message, prefix), meta);
}
exports.logWarn = logWarn;
/**
 * Logs an info message
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
function logInfo(message, info) {
    var _a = getLogInfo(info), settings = _a.settings, prefix = _a.prefix, meta = _a.meta;
    var client = initLogger(settings || settingsInUse);
    client.info(processMessage(message, prefix), meta);
}
exports.logInfo = logInfo;
/**
 * Logs a verbose message
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
function logVerbose(message, info) {
    var _a = getLogInfo(info), settings = _a.settings, prefix = _a.prefix, meta = _a.meta;
    var client = initLogger(settings || settingsInUse);
    client.verbose(processMessage(message, prefix), meta);
}
exports.logVerbose = logVerbose;
/**
 * Logs a debug message. `logDebug` is a convenient and import-friendly alias
 * @param message The message to log
 * @param prefix A prefix to put in front of the log
 * @param meta Metadata to add to the log
 */
function logDebug(message, info) {
    var _a = getLogInfo(info), settings = _a.settings, prefix = _a.prefix, meta = _a.meta;
    var client = initLogger(settings || settingsInUse);
    client.debug(processMessage(message, prefix), meta);
}
exports.logDebug = logDebug;
